"use client";

import { LinkButton } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/icons";

interface RecipeHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saving?: boolean;
}

export default function RecipeHeader({ title, onTitleChange, saving = false }: RecipeHeaderProps) {
  return (
    <header className="sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <LinkButton
          href="/recipes"
          variant="link"
          size="sm"
          className="w-fit flex items-center gap-1"
          aria-label="조리법 목록으로 돌아가기"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          목록으로
        </LinkButton>
        {saving && (
          <span
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-label="저장 중"
          >
            저장 중...
          </span>
        )}
      </div>
      <input
        type="text"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-ring rounded"
        placeholder="조리법 제목"
        aria-label="조리법 제목"
      />
    </header>
  );
}
