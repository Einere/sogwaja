"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, AppleIcon } from "@/components/icons";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSocialLogin = async (provider: "google" | "apple") => {
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg p-8 shadow-md">
          <h1 className="mb-8 text-center text-2xl font-bold">구움과자 조리법</h1>
          <p className="text-muted-foreground mb-8 text-center">
            조리법을 저장하고 관리하려면 로그인이 필요합니다.
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              variant="outline"
              className="flex w-full items-center justify-center gap-3"
            >
              <GoogleIcon />
              Google로 로그인
            </Button>

            <Button
              onClick={() => handleSocialLogin("apple")}
              disabled={loading}
              variant="primary"
              className="flex w-full items-center justify-center gap-3 bg-black hover:bg-black/90"
            >
              <AppleIcon />
              Apple로 로그인
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            로그인 시 조리법 저장 및 관리 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
