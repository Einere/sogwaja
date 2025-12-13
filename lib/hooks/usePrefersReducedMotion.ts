import { useEffect, useState } from "react";

/**
 * prefers-reduced-motion 미디어 쿼리를 감지하는 훅
 * 사용자의 모션 감소 설정을 추적하고 변경사항을 반영합니다.
 */
export function usePrefersReducedMotion(): boolean {
  // SSR 환경에서는 window가 없으므로 초기값은 false
  // 클라이언트에서 마운트될 때 실제 값을 확인
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    // SSR 환경에서는 window가 없을 수 있으므로 체크
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 변경 감지 리스너
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // addEventListener 사용 (addListener는 deprecated)
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []); // 빈 의존성 배열 - 마운트 시 한 번만 실행

  return prefersReducedMotion;
}
