import { NextResponse } from "next/server";
import { createAuthenticationOptions } from "@/lib/webauthn/server";

export async function POST() {
  try {
    // 인증은 로그인하지 않은 사용자도 시도할 수 있음 (discoverable credentials)
    const { options, challengeId } = await createAuthenticationOptions();

    return NextResponse.json({ options, challengeId });
  } catch (error) {
    console.error("Authentication options error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate authentication options",
      },
      { status: 500 }
    );
  }
}
