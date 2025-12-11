"use client";

import type { Database } from "@/types/database";
import RecipeCard from "./RecipeCard";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeListProps {
  recipes: Recipe[];
  onDelete: (id: string) => Promise<void>;
  deletingId?: string | null;
}

export default function RecipeList({ recipes, onDelete, deletingId }: RecipeListProps) {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="list" aria-label="조리법 목록">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onDelete={onDelete}
          isDeleting={deletingId === recipe.id}
        />
      ))}
    </div>
  );
}
