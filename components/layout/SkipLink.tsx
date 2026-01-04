"use client";

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:ring-ring focus:ring-offset-background bg-background text-foreground border-border fixed top-4 left-4 z-50 rounded-md border px-4 py-2 font-medium shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
    >
      메인 콘텐츠로 건너뛰기
    </a>
  );
}

