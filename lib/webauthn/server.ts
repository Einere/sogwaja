import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialDescriptorJSON,
} from "@simplewebauthn/types";
import { rpName, getRpID, getOrigin, CHALLENGE_TTL_MS } from "./config";
import { createClient } from "@supabase/supabase-js";

export interface UserPasskey {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  transports: string[] | null;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

// Service Role 클라이언트 생성 (챌린지 테이블 접근용)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for service role");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Base64URL 인코딩/디코딩 헬퍼 함수
function uint8ArrayToBase64URL(uint8Array: Uint8Array): string {
  // Uint8Array를 Buffer로 변환 후 base64url 인코딩
  return Buffer.from(uint8Array).toString("base64url");
}

function base64URLToUint8Array(base64url: string): Uint8Array<ArrayBuffer> {
  // base64url 디코딩 후 Uint8Array로 변환
  const buffer = Buffer.from(base64url, "base64url");
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return new Uint8Array(arrayBuffer);
}

// 사용자의 기존 패스키 조회
export async function getUserPasskeys(userId: string): Promise<UserPasskey[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase.from("user_passkeys").select("*").eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch user passkeys: ${error.message}`);
  }

  return (data as UserPasskey[]) || [];
}

// 챌린지 저장
async function saveChallenge(
  userId: string | null,
  challenge: string,
  type: "registration" | "authentication"
): Promise<string> {
  const supabase = getServiceClient();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("webauthn_challenges")
    .insert({
      user_id: userId,
      challenge,
      type,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save challenge: ${error.message}`);
  }

  return data.id;
}

// 챌린지 조회 및 삭제
async function consumeChallenge(
  challengeId: string,
  type: "registration" | "authentication"
): Promise<string> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("webauthn_challenges")
    .select("*")
    .eq("id", challengeId)
    .eq("type", type)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    throw new Error("Challenge not found or expired");
  }

  // 챌린지 삭제 (일회용)
  await supabase.from("webauthn_challenges").delete().eq("id", challengeId);

  return data.challenge;
}

// 등록 옵션 생성
export async function createRegistrationOptions(userId: string, userEmail: string) {
  const existingPasskeys = await getUserPasskeys(userId);
  const rpID = getRpID();

  const excludeCredentials: PublicKeyCredentialDescriptorJSON[] = existingPasskeys.map(passkey => ({
    id: passkey.credential_id,
    type: "public-key",
    transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(userId),
    userName: userEmail,
    userDisplayName: userEmail.split("@")[0],
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256
  });

  // 챌린지 저장
  const challengeId = await saveChallenge(userId, options.challenge, "registration");

  return {
    options,
    challengeId,
  };
}

// 등록 검증
export async function verifyRegistration(
  userId: string,
  challengeId: string,
  response: RegistrationResponseJSON,
  deviceName?: string
): Promise<VerifiedRegistrationResponse> {
  const expectedChallenge = await consumeChallenge(challengeId, "registration");
  const rpID = getRpID();
  const origin = getOrigin();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registration verification failed");
  }

  // 패스키 저장
  const supabase = getServiceClient();
  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  // SimpleWebAuthn v13: credential.id는 Base64URLString, publicKey는 Uint8Array
  // publicKey를 base64url로 인코딩하여 저장
  const { error } = await supabase.from("user_passkeys").insert({
    user_id: userId,
    credential_id: credential.id,
    public_key: uint8ArrayToBase64URL(credential.publicKey),
    counter: credential.counter,
    transports: response.response.transports || null,
    device_name: deviceName || `${credentialDeviceType}${credentialBackedUp ? " (synced)" : ""}`,
  });

  if (error) {
    throw new Error(`Failed to save passkey: ${error.message}`);
  }

  return verification;
}

// 인증 옵션 생성
export async function createAuthenticationOptions(userId?: string) {
  const rpID = getRpID();

  let allowCredentials: PublicKeyCredentialDescriptorJSON[] | undefined;

  if (userId) {
    const passkeys = await getUserPasskeys(userId);
    allowCredentials = passkeys.map(passkey => ({
      id: passkey.credential_id,
      type: "public-key",
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    }));
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: "preferred",
  });

  // 챌린지 저장 (userId가 없을 수도 있음 - discoverable credentials)
  const challengeId = await saveChallenge(userId || null, options.challenge, "authentication");

  return {
    options,
    challengeId,
  };
}

// 인증 검증
export async function verifyAuthentication(
  challengeId: string,
  response: AuthenticationResponseJSON
): Promise<{ verified: boolean; userId: string }> {
  const expectedChallenge = await consumeChallenge(challengeId, "authentication");
  const rpID = getRpID();
  const origin = getOrigin();

  // credential_id로 패스키 찾기
  const supabase = getServiceClient();
  const credentialId = response.id;

  const { data: passkey, error } = await supabase
    .from("user_passkeys")
    .select("*")
    .eq("credential_id", credentialId)
    .single();

  if (error || !passkey) {
    throw new Error("Passkey not found");
  }

  // DB에서 가져온 base64url 인코딩된 publicKey를 Uint8Array로 변환
  const publicKey = base64URLToUint8Array(passkey.public_key);

  const verification: VerifiedAuthenticationResponse = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.credential_id,
      publicKey,
      counter: passkey.counter,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    throw new Error("Authentication verification failed");
  }

  // 카운터 업데이트 및 마지막 사용 시간 갱신
  await supabase
    .from("user_passkeys")
    .update({
      counter: verification.authenticationInfo.newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", passkey.id);

  return {
    verified: true,
    userId: passkey.user_id,
  };
}

// 패스키 삭제
export async function deletePasskey(userId: string, passkeyId: string): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("user_passkeys")
    .delete()
    .eq("id", passkeyId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete passkey: ${error.message}`);
  }
}

// 패스키 이름 업데이트
export async function updatePasskeyName(
  userId: string,
  passkeyId: string,
  deviceName: string
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("user_passkeys")
    .update({ device_name: deviceName })
    .eq("id", passkeyId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update passkey name: ${error.message}`);
  }
}

// 패스키 인증 성공 후 세션 생성을 위한 매직 링크 토큰 생성
export async function createSessionToken(userId: string): Promise<{
  token: string;
  email: string;
}> {
  const supabase = getServiceClient();

  // 사용자 정보 조회
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    throw new Error(`Failed to get user: ${userError?.message || "User not found"}`);
  }

  const email = userData.user.email;
  if (!email) {
    throw new Error("User email not found");
  }

  // 매직 링크 생성 (OTP 토큰 포함)
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error(`Failed to generate session token: ${linkError?.message || "Unknown error"}`);
  }

  return {
    token: linkData.properties.hashed_token,
    email,
  };
}
