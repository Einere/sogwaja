import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";

export interface Passkey {
  id: string;
  deviceName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

// 패스키 등록
export async function registerPasskey(deviceName?: string): Promise<boolean> {
  // 1. 서버에서 등록 옵션 요청
  const optionsResponse = await fetch("/api/webauthn/register/options", {
    method: "POST",
  });

  if (!optionsResponse.ok) {
    const error = await optionsResponse.json();
    throw new Error(error.error || "Failed to get registration options");
  }

  const { options, challengeId } = (await optionsResponse.json()) as {
    options: PublicKeyCredentialCreationOptionsJSON;
    challengeId: string;
  };

  // 2. 브라우저에서 패스키 생성
  const registrationResponse = await startRegistration({ optionsJSON: options });

  // 3. 서버에서 검증
  const verifyResponse = await fetch("/api/webauthn/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId,
      response: registrationResponse,
      deviceName,
    }),
  });

  if (!verifyResponse.ok) {
    const error = await verifyResponse.json();
    throw new Error(error.error || "Failed to verify registration");
  }

  const { verified } = await verifyResponse.json();
  return verified;
}

export interface PasskeyAuthResult {
  verified: boolean;
  token?: string;
  email?: string;
}

// 패스키로 인증
export async function authenticateWithPasskey(): Promise<PasskeyAuthResult> {
  // 1. 서버에서 인증 옵션 요청
  const optionsResponse = await fetch("/api/webauthn/authenticate/options", {
    method: "POST",
  });

  if (!optionsResponse.ok) {
    const error = await optionsResponse.json();
    throw new Error(error.error || "Failed to get authentication options");
  }

  const { options, challengeId } = (await optionsResponse.json()) as {
    options: PublicKeyCredentialRequestOptionsJSON;
    challengeId: string;
  };

  // 2. 브라우저에서 패스키 사용
  const authenticationResponse = await startAuthentication({ optionsJSON: options });

  // 3. 서버에서 검증
  const verifyResponse = await fetch("/api/webauthn/authenticate/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId,
      response: authenticationResponse,
    }),
  });

  if (!verifyResponse.ok) {
    const error = await verifyResponse.json();
    throw new Error(error.error || "Failed to verify authentication");
  }

  return verifyResponse.json();
}

// 패스키 목록 조회
export async function getPasskeys(): Promise<Passkey[]> {
  const response = await fetch("/api/webauthn/passkeys");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get passkeys");
  }

  const { passkeys } = await response.json();
  return passkeys;
}

// 패스키 삭제
export async function deletePasskey(passkeyId: string): Promise<void> {
  const response = await fetch("/api/webauthn/passkeys", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passkeyId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete passkey");
  }
}

// 패스키 이름 변경
export async function updatePasskeyName(passkeyId: string, deviceName: string): Promise<void> {
  const response = await fetch("/api/webauthn/passkeys", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passkeyId, deviceName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update passkey name");
  }
}

// 브라우저가 WebAuthn을 지원하는지 확인
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  );
}

// 플랫폼 인증자(Face ID, Touch ID, Windows Hello 등) 사용 가능 여부 확인
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// 조건부 UI(autofill) 지원 여부 확인
export async function isConditionalUISupported(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    if (typeof PublicKeyCredential.isConditionalMediationAvailable === "function") {
      return await PublicKeyCredential.isConditionalMediationAvailable();
    }
    return false;
  } catch {
    return false;
  }
}
