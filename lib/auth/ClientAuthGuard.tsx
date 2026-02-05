"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface ClientAuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">로딩 중...</div>
    </div>
  );
}

/**
 * 클라이언트 측 인증 가드 컴포넌트.
 * 클라이언트 컴포넌트 내에서 인증이 필요한 UI를 보호할 때 사용합니다.
 *
 * 대부분의 경우 서버 측 AuthGuard를 레이아웃에서 사용하는 것이 권장됩니다.
 * 이 컴포넌트는 클라이언트 전용 페이지나 동적 인증 체크가 필요한 경우에 사용하세요.
 *
 * @param children - 인증된 사용자에게 렌더링할 자식 컴포넌트
 * @param redirectTo - 미인증 사용자를 리다이렉트할 경로 (기본값: "/auth")
 * @param fallback - 로딩 중 표시할 컴포넌트 (기본값: LoadingFallback)
 *
 * @example
 * ```tsx
 * <ClientAuthGuard redirectTo="/login" fallback={<Spinner />}>
 *   <ProtectedClientContent />
 * </ClientAuthGuard>
 * ```
 */
export function ClientAuthGuard({
  children,
  redirectTo = "/auth",
  fallback = <LoadingFallback />,
}: ClientAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) return <>{fallback}</>;
  if (!user) return null;
  return <>{children}</>;
}
