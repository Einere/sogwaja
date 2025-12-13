"use client";

import { Ssgoi } from "@ssgoi/react";
import { drill, slide } from "@ssgoi/react/view-transitions";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

const nullConfig = {};
const config = {
  transitions: [
    {
      from: "recipes",
      to: "recipe-editor",
      transition: drill({
        direction: "enter",
      }),
      symmetric: true,
    },
    {
      from: "recipe-editor",
      to: "recipes",
      transition: drill({
        direction: "exit",
      }),
      symmetric: true,
    },
    {
      from: "recipe-editor",
      to: "experiments",
      transition: drill({
        direction: "enter",
      }),
      symmetric: true,
    },
    {
      from: "experiments",
      to: "recipe-editor",
      transition: drill({
        direction: "exit",
      }),
      symmetric: true,
    },

    {
      from: "experiments",
      to: "experiment",
      transition: drill({
        direction: "enter",
      }),
      symmetric: true,
    },
    {
      from: "experiment",
      to: "experiments",
      transition: drill({
        direction: "exit",
      }),
      symmetric: true,
    },
    {
      from: "foo",
      to: "bar",
      transition: slide({
        direction: "left",
        spring: {
          stiffness: 400, // 빠른 트랜지션
          damping: 35, // 부드러운 마무리
        },
      }),
      symmetric: true,
    },
    {
      from: "bar",
      to: "foo",
      transition: slide({
        direction: "right",
        spring: {
          stiffness: 400, // 빠른 트랜지션
          damping: 35, // 부드러운 마무리
        },
      }),
      symmetric: true,
    },
  ],
};

/**
 * SSGOI Provider 컴포넌트
 * 모바일 앱 스타일의 페이지 전환 애니메이션을 제공합니다.
 */
export default function SsgoiProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Ssgoi config={prefersReducedMotion ? nullConfig : config}>
      <div style={{ position: "relative", minHeight: "100vh" }}>{children}</div>
    </Ssgoi>
  );
}
