import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { getRecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import RecipeEditorClient from "./RecipeEditorClient";

interface RecipeEditorPageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function RecipeEditorPage({ params }: RecipeEditorPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/auth");
  }

  const { recipeId } = await params;
  const recipeData = await getRecipeData(recipeId);

  return <RecipeEditorClient initialData={recipeData} recipeId={recipeId} user={user} />;
}
