import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyRegistration } from "@/lib/webauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/types";

interface VerifyRequest {
  challengeId: string;
  response: RegistrationResponseJSON;
  deviceName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: VerifyRequest = await request.json();
    const { challengeId, response, deviceName } = body;

    if (!challengeId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const verification = await verifyRegistration(user.id, challengeId, response, deviceName);

    return NextResponse.json({ verified: verification.verified });
  } catch (error) {
    console.error("Registration verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify registration" },
      { status: 500 }
    );
  }
}
