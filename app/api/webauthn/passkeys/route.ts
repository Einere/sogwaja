import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPasskeys, deletePasskey, updatePasskeyName } from "@/lib/webauthn/server";

// 패스키 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const passkeys = await getUserPasskeys(user.id);

    // 민감한 정보 제외하고 반환
    const safePasskeys = passkeys.map(p => ({
      id: p.id,
      deviceName: p.device_name,
      createdAt: p.created_at,
      lastUsedAt: p.last_used_at,
    }));

    return NextResponse.json({ passkeys: safePasskeys });
  } catch (error) {
    console.error("Get passkeys error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get passkeys" },
      { status: 500 }
    );
  }
}

// 패스키 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { passkeyId } = await request.json();

    if (!passkeyId) {
      return NextResponse.json({ error: "Missing passkey ID" }, { status: 400 });
    }

    await deletePasskey(user.id, passkeyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete passkey error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete passkey" },
      { status: 500 }
    );
  }
}

// 패스키 이름 변경
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { passkeyId, deviceName } = await request.json();

    if (!passkeyId || !deviceName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updatePasskeyName(user.id, passkeyId, deviceName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update passkey error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update passkey" },
      { status: 500 }
    );
  }
}
