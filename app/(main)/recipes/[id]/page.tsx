import { getRecipeData } from "@/app/recipes/[id]/actions";
import { notFound } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import RecipeEditorClient from "./RecipeEditorClient";

interface RecipeEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeEditorPage({ params }: RecipeEditorPageProps) {
  const { id: recipeId } = await params;

  const user = await getServerUser();
  if (!user) {
    notFound();
  }

  const recipeData = await getRecipeData(recipeId);

  return <RecipeEditorClient initialData={recipeData} recipeId={recipeId} user={user} />;
}
