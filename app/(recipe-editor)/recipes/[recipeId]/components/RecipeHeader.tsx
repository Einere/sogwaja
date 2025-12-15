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
    <header className="bg-background border-border sticky top-0 z-10 border-b px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <LinkButton
          href="/recipes"
          variant="link"
          size="sm"
          className="flex w-fit items-center gap-1"
          aria-label="조리법 목록으로 돌아가기"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          목록으로
        </LinkButton>
        {saving && (
          <span
            className="text-muted-foreground text-sm"
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
        className="focus:ring-ring w-full rounded border-none text-2xl font-bold focus:ring-2 focus:outline-none"
        placeholder="조리법 제목"
        aria-label="조리법 제목"
      />
    </header>
  );
}
