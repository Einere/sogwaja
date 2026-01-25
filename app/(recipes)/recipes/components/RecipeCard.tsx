"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import type { Database } from "@/types/database";
import { LinkButton, Button, Card } from "@/components/ui";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function RecipeCard({ recipe, onDelete, isDeleting = false }: RecipeCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete(recipe.id);
  };

  return (
    <ViewTransition default={prefersReducedMotion ? "none" : undefined}>
      <Card
        className="p-4 transition-shadow hover:shadow-md"
        aria-labelledby={`recipe-title-${recipe.id}`}
      >
      <Link href={`/recipes/${recipe.id}`} className="block">
        <h2 id={`recipe-title-${recipe.id}`} className="mb-1 text-lg font-semibold">
          {recipe.title}
        </h2>
        <time className="text-muted-foreground text-sm" dateTime={recipe.updated_at}>
          {new Date(recipe.updated_at).toLocaleDateString("ko-KR")}
        </time>
      </Link>
      <div className="mt-3 flex gap-2">
        <LinkButton
          href={`/recipes/${recipe.id}/experiments`}
          variant="link"
          size="sm"
          aria-label={`${recipe.title}의 실험 목록 보기`}
        >
          실험 목록
        </LinkButton>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="ghost"
          size="sm"
          className="text-error hover:text-error"
          aria-label={`${recipe.title} 삭제`}
          aria-busy={isDeleting}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      </div>
    </Card>
    </ViewTransition>
  );
}
