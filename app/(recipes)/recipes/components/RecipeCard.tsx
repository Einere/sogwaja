"use client";

import Link from "next/link";
import type { Database } from "@/types/database";
import TextLink from "@/components/ui/TextLink";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ViewTransition } from "react";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function RecipeCard({ recipe, onDelete, isDeleting = false }: RecipeCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete(recipe.id);
  };

  return (
    <ViewTransition name={`recipe-card-${recipe.id}`} default={reducedMotion ? "none" : "auto"}>
      <Card
        className="p-4 hover:shadow-md transition-shadow"
        aria-labelledby={`recipe-title-${recipe.id}`}
      >
        <Link href={`/recipes/${recipe.id}`} className="block">
          <h2 id={`recipe-title-${recipe.id}`} className="text-lg font-semibold mb-1">
            {recipe.title}
          </h2>
          <time className="text-sm text-muted-foreground" dateTime={recipe.updated_at}>
            {new Date(recipe.updated_at).toLocaleDateString("ko-KR")}
          </time>
        </Link>
        <div className="mt-3 flex gap-2">
          <TextLink
            href={`/recipes/${recipe.id}/experiments`}
            size="sm"
            aria-label={`${recipe.title}의 실험 목록 보기`}
          >
            실험 목록
          </TextLink>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="ghost"
            size="sm"
            className="text-error hover:text-error"
            aria-label={`${recipe.title} 삭제`}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </Card>
    </ViewTransition>
  );
}
