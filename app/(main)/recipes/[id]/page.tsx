import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { getRecipeData } from "@/app/recipes/[id]/actions";
import RecipeEditorClient from "./RecipeEditorClient";

interface RecipeEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeEditorPage({ params }: RecipeEditorPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id: recipeId } = await params;
  const recipeData = await getRecipeData(recipeId);

  return <RecipeEditorClient initialData={recipeData} recipeId={recipeId} user={user} />;
}
