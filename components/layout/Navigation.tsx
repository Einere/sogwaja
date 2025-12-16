"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { PencilIcon, ClipboardIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const pathname = usePathname();
  const params = useParams();
  const recipeId = (params.recipeId || params.id) as string | undefined;

  // recipeId가 없으면 Navigation을 렌더링하지 않음
  if (!recipeId) {
    return null;
  }

  return (
    <nav
      className="bg-background border-border fixed right-0 bottom-0 left-0 mx-auto max-w-md border-t"
      aria-label="주요 네비게이션"
    >
      <div className="flex h-16 items-center justify-around" role="list">
        <Link
          href={`/recipes/${recipeId}/experiments/new`}
          className={cn(
            "focus:ring-ring flex h-full flex-1 flex-col items-center justify-center rounded transition-colors focus:ring-2 focus:outline-none",
            pathname === `/recipes/${recipeId}/experiments/new`
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="실험 저장"
          aria-current={pathname === `/recipes/${recipeId}/experiments/new` ? "page" : undefined}
        >
          <PencilIcon className="mb-1 h-6 w-6" />
          <span className="text-xs">실험 저장</span>
        </Link>
        <Link
          href={`/recipes/${recipeId}/experiments`}
          className={cn(
            "focus:ring-ring flex h-full flex-1 flex-col items-center justify-center rounded transition-colors focus:ring-2 focus:outline-none",
            pathname === `/recipes/${recipeId}/experiments`
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="실험 목록"
          aria-current={pathname === `/recipes/${recipeId}/experiments` ? "page" : undefined}
        >
          <ClipboardIcon className="mb-1 h-6 w-6" />
          <span className="text-xs">실험 목록</span>
        </Link>
      </div>
    </nav>
  );
}
