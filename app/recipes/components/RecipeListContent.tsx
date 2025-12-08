"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteRecipe } from "../actions";
import RecipeList from "./RecipeList";
import type { Database } from "@/types/database";
import type { SortOption } from "../actions";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeListContentProps {
  recipes: Recipe[];
}

export default function RecipeListContent({ recipes }: RecipeListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // URL에서 정렬 옵션 가져오기
  const sortBy: SortOption = (searchParams.get("sort") as SortOption) || "updated";

  // 클라이언트에서 정렬 (서버 요청 없음)
  const sortedRecipes = useMemo(() => {
    const sorted = [...recipes];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else {
      // updated_at 기준 내림차순 (최신순)
      sorted.sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA;
      });
    }
    return sorted;
  }, [recipes, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setDeletingId(id);
    try {
      await deleteRecipe(id);
      // Refresh the page to show updated list
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return <RecipeList recipes={sortedRecipes} onDelete={handleDelete} deletingId={deletingId} />;
}
