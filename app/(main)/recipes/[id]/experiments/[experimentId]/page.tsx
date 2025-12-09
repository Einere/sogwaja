import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { getExperiment } from "@/app/recipes/[id]/experiments/actions";
import { getRecipeData } from "@/app/recipes/[id]/actions";
import ExperimentDetailClient from "./ExperimentDetailClient";

interface ExperimentDetailPageProps {
  params: Promise<{ id: string; experimentId: string }>;
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id: recipeId, experimentId } = await params;

  const [experiment, recipeData] = await Promise.all([
    getExperiment(experimentId),
    getRecipeData(recipeId),
  ]);

  return (
    <ExperimentDetailClient
      experiment={experiment}
      recipe={recipeData.recipe}
      equipment={recipeData.equipment}
      ingredients={recipeData.ingredients}
      outputs={recipeData.outputs}
      steps={recipeData.steps}
      recipeId={recipeId}
      experimentId={experimentId}
    />
  );
}
