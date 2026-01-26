import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication, createSessionToken } from "@/lib/webauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

interface VerifyRequest {
  challengeId: string;
  response: AuthenticationResponseJSON;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { challengeId, response } = body;

    if (!challengeId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { verified, userId } = await verifyAuthentication(challengeId, response);

    if (!verified) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    // 패스키 인증 성공 - 세션 토큰 생성
    const { token, email } = await createSessionToken(userId);

    return NextResponse.json({
      verified,
      token,
      email,
    });
  } catch (error) {
    console.error("Authentication verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify authentication" },
      { status: 500 }
    );
  }
}
