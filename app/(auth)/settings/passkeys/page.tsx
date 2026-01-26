"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePasskey } from "@/lib/hooks/usePasskey";
import { Button } from "@/components/ui";
import { ArrowLeftIcon, PasskeyIcon, PlusIcon, XIcon } from "@/components/icons";
import Link from "next/link";

export default function PasskeysPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    isSupported,
    isPlatformAvailable,
    isLoading,
    error,
    passkeys,
    registerPasskey,
    loadPasskeys,
    deletePasskey,
    clearError,
  } = usePasskey();

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setIsAuthenticated(true);
      loadPasskeys();
    };

    checkAuth();
  }, [router, supabase.auth, loadPasskeys]);

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      alert("기기 이름을 입력해주세요.");
      return;
    }

    const success = await registerPasskey(deviceName.trim());
    if (success) {
      setDeviceName("");
      setIsRegistering(false);
    }
  };

  const handleDelete = async (passkeyId: string, name: string | null) => {
    if (!confirm(`"${name || "이름 없음"}" 패스키를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePasskey(passkeyId);
    } catch {
      // 에러는 usePasskey 훅에서 처리됨
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/recipes"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          조리법 목록으로
        </Link>
      </div>

      <div className="bg-background rounded-lg p-6 shadow-md">
        <div className="mb-6 flex items-center gap-3">
          <PasskeyIcon className="h-6 w-6" />
          <h1 className="text-xl font-bold">패스키 관리</h1>
        </div>

        {!isSupported && (
          <div className="bg-destructive/10 text-destructive mb-6 rounded-md p-4">
            이 브라우저는 패스키를 지원하지 않습니다.
          </div>
        )}

        {isSupported && !isPlatformAvailable && (
          <div className="mb-6 rounded-md bg-yellow-100 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
            이 기기에서는 패스키를 사용할 수 없습니다. Face ID, Touch ID 또는 Windows Hello가 필요합니다.
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive mb-6 flex items-center justify-between rounded-md p-4">
            <span>{error}</span>
            <button onClick={clearError} className="hover:opacity-70">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-6">
          <p className="text-muted-foreground text-sm">
            패스키를 사용하면 비밀번호 없이 안전하게 로그인할 수 있습니다. Face ID, Touch ID 또는
            Windows Hello를 사용하여 인증합니다.
          </p>
        </div>

        {/* 패스키 목록 */}
        <div className="mb-6">
          <h2 className="mb-4 font-semibold">등록된 패스키</h2>

          {isLoading && passkeys.length === 0 ? (
            <p className="text-muted-foreground text-sm">로딩 중...</p>
          ) : passkeys.length === 0 ? (
            <p className="text-muted-foreground text-sm">등록된 패스키가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {passkeys.map((passkey) => (
                <li
                  key={passkey.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div>
                    <p className="font-medium">{passkey.deviceName || "이름 없음"}</p>
                    <p className="text-muted-foreground text-xs">
                      등록: {formatDate(passkey.createdAt)}
                    </p>
                    {passkey.lastUsedAt && (
                      <p className="text-muted-foreground text-xs">
                        마지막 사용: {formatDate(passkey.lastUsedAt)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(passkey.id, passkey.deviceName)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 패스키 등록 */}
        {isSupported && isPlatformAvailable && (
          <div className="border-t pt-6">
            {isRegistering ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="deviceName" className="mb-2 block text-sm font-medium">
                    기기 이름
                  </label>
                  <input
                    id="deviceName"
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="예: MacBook Pro, iPhone 15"
                    className="border-input bg-background w-full rounded-md border px-3 py-2"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRegister} disabled={isLoading}>
                    {isLoading ? "등록 중..." : "패스키 등록"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRegistering(false);
                      setDeviceName("");
                    }}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsRegistering(true)}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <PlusIcon className="h-4 w-4" />새 패스키 등록
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
