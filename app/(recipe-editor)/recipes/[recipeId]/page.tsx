import type { Metadata } from "next";
import { requireServerUser } from "@/lib/supabase/auth";
import { getRecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import RecipeEditorClient from "./RecipeEditorClient";

interface RecipeEditorPageProps {
  params: Promise<{ recipeId: string }>;
}

export async function generateMetadata({ params }: RecipeEditorPageProps): Promise<Metadata> {
  const { recipeId } = await params;
  const { recipe } = await getRecipeData(recipeId);

  return {
    title: `${recipe.title} - 편집`,
    description: `${recipe.title} 조리법을 편집하세요`,
  };
}

export default async function RecipeEditorPage({ params }: RecipeEditorPageProps) {
  const user = await requireServerUser();
  const { recipeId } = await params;
  const recipeData = await getRecipeData(recipeId);

  return <RecipeEditorClient initialData={recipeData} recipeId={recipeId} user={user} />;
}
