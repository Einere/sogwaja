"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, PasskeyIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { usePasskey } from "@/lib/hooks/usePasskey";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const {
    isSupported: isPasskeySupported,
    isPlatformAvailable,
    isLoading: isPasskeyLoading,
    error: passkeyError,
    authenticateWithPasskey,
    clearError,
  } = usePasskey();

  const [showPasskeyOption, setShowPasskeyOption] = useState(false);

  useEffect(() => {
    // 패스키 지원 여부 확인 후 옵션 표시
    if (isPasskeySupported && isPlatformAvailable) {
      setShowPasskeyOption(true);
    }
  }, [isPasskeySupported, isPlatformAvailable]);

  const handlePasskeyLogin = async () => {
    try {
      clearError();
      const result = await authenticateWithPasskey();

      if (result.verified && result.token) {
        // 패스키 인증 성공 - token_hash로 Supabase 세션 생성
        const { error } = await supabase.auth.verifyOtp({
          token_hash: result.token,
          type: "email",
        });

        if (error) {
          console.error("Session creation error:", error);
          throw new Error("세션 생성에 실패했습니다.");
        }

        // 세션 생성 성공 - 레시피 목록으로 이동
        window.location.href = "/recipes";
      }
    } catch (error) {
      console.error("Passkey login error:", error);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    try {
      setLoading(true);

      // Check if Supabase URL is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("Supabase URL이 설정되지 않았습니다. 환경 변수를 확인해주세요.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }

      // OAuth는 리디렉션을 수행하므로 여기서는 성공으로 간주
      // 실제 인증은 콜백 URL에서 처리됩니다
    } catch (error) {
      console.error("Error signing in:", error);
      const errorMessage =
        error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg p-8 shadow-md">
          <h1 className="mb-8 text-center text-2xl font-bold">구움과자 조리법</h1>
          <p className="text-muted-foreground mb-8 text-center">
            조리법을 저장하고 관리하려면 로그인이 필요합니다.
          </p>

          <div className="space-y-3" aria-label="로그인 폼">
            <Button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={loading || isPasskeyLoading}
              variant="outline"
              className="flex w-full items-center justify-center gap-3"
              aria-label={loading ? "Google 로그인 중" : "Google로 로그인"}
              aria-busy={loading}
            >
              <GoogleIcon />
              Google로 로그인
            </Button>

            {showPasskeyOption && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">또는</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={loading || isPasskeyLoading}
                  variant="outline"
                  className="flex w-full items-center justify-center gap-3"
                  aria-label={isPasskeyLoading ? "패스키 인증 중" : "패스키로 로그인"}
                  aria-busy={isPasskeyLoading}
                >
                  <PasskeyIcon />
                  패스키로 로그인
                </Button>
              </>
            )}

            {passkeyError && (
              <p className="text-destructive text-center text-sm">{passkeyError}</p>
            )}
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            로그인 시 조리법 저장 및 관리 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}
