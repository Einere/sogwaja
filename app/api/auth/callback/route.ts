import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const origin = requestUrl.origin;

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${origin}/recipes`);
  } catch (error) {
    console.error("Unexpected error in auth callback:", error);
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    return NextResponse.redirect(`${origin}/login?error=authentication_failed`);
  }
}
