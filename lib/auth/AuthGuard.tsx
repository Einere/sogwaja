import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * 서버 측 인증 가드 컴포넌트.
 * 미인증 사용자를 지정된 경로로 리다이렉트합니다.
 *
 * 레이아웃 파일에서 사용하여 해당 route group 전체를 보호합니다.
 * getServerUser()는 React cache()를 사용하여 요청 내 중복 호출을 최적화합니다.
 *
 * @param children - 인증된 사용자에게 렌더링할 자식 컴포넌트
 * @param redirectTo - 미인증 사용자를 리다이렉트할 경로 (기본값: "/auth")
 *
 * @example
 * ```tsx
 * // app/(protected)/layout.tsx
 * export default function ProtectedLayout({ children }) {
 *   return (
 *     <AuthGuard redirectTo="/login">
 *       {children}
 *     </AuthGuard>
 *   );
 * }
 * ```
 */
export async function AuthGuard({
  children,
  redirectTo = "/auth",
}: AuthGuardProps) {
  const user = await getServerUser();

  if (!user) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
