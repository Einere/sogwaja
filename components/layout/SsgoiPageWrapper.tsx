"use client";

import { SsgoiTransition } from "@ssgoi/react";
import { usePathname } from "next/navigation";

/**
 * SSGOI 페이지 래퍼 컴포넌트
 * 현재 경로를 자동으로 감지하여 SsgoiTransition으로 감쌉니다.
 */
export default function SsgoiPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SsgoiTransition id={pathname} className="min-h-full w-full">
      {children}
    </SsgoiTransition>
  );
}
