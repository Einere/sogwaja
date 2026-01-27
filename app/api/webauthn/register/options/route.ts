import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRegistrationOptions } from "@/lib/webauthn/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { options, challengeId } = await createRegistrationOptions(user.id, user.email || "");

    return NextResponse.json({ options, challengeId });
  } catch (error) {
    console.error("Registration options error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate registration options" },
      { status: 500 }
    );
  }
}
