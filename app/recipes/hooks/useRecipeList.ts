"use client";

import { useState, useEffect, useCallback } from "react";
import { getRecipes, deleteRecipe, type SortOption } from "../actions";
import type { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

interface UseRecipeListResult {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  handleDelete: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRecipeList(): UseRecipeListResult {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipesData = await getRecipes(sortBy);
      setRecipes(recipesData);
    } catch {
      setError("조리법 목록을 불러오는 중 오류가 발생했습니다.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteRecipe(id);
      await loadRecipes();
    },
    [loadRecipes]
  );

  return {
    recipes,
    loading,
    error,
    sortBy,
    setSortBy,
    handleDelete,
    refresh: loadRecipes,
  };
}
