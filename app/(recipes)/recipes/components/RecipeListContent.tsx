"use client";

import { useState, useMemo, useEffect, useCallback, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { deleteRecipe } from "../actions";
import RecipeList from "./RecipeList";
import RecipeListHeader from "./RecipeListHeader";
import type { Database } from "@/types/database";
import type { SortOption } from "../actions";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface RecipeListContentProps {
  recipes: Recipe[];
}

export default function RecipeListContent({ recipes }: RecipeListContentProps) {
  const searchParams = useSearchParams();
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>(recipes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // URL에서 초기 정렬 옵션 가져오기
  const initialSort: SortOption = (searchParams.get("sort") as SortOption) || "updated";
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  // 서버에서 받은 recipes가 변경되면 로컬 state 업데이트
  useEffect(() => {
    setLocalRecipes(recipes);
  }, [recipes]);

  // 정렬 변경 핸들러 (URL 동기화 포함, startTransition으로 View Transition 트리거)
  const handleSortChange = useCallback((sort: SortOption) => {
    startTransition(() => {
      setSortBy(sort);
    });
    // URL 동기화 (SSR 트리거 없이)
    const url = new URL(window.location.href);
    url.searchParams.set("sort", sort);
    window.history.replaceState(null, "", url.toString());
  }, []);

  // 클라이언트에서 정렬 (서버 요청 없음)
  const sortedRecipes = useMemo(() => {
    const sorted = [...localRecipes];
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
  }, [localRecipes, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    // 1. 이전 상태 저장 (롤백용)
    const previousRecipes = localRecipes;

    // 2. 즉시 UI에서 제거 (낙관적)
    setLocalRecipes(prev => prev.filter(recipe => recipe.id !== id));
    setDeletingId(id);

    try {
      // 3. 백그라운드에서 서버 요청
      await deleteRecipe(id);
    } catch (err) {
      // 5. 실패 시 롤백
      setLocalRecipes(previousRecipes);
      const errorMessage = err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <RecipeListHeader sortBy={sortBy} onSortChange={handleSortChange} />
      <div className="px-4 py-4">
        <RecipeList recipes={sortedRecipes} onDelete={handleDelete} deletingId={deletingId} />
      </div>
    </>
  );
}
