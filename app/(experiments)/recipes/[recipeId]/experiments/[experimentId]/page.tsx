import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { getExperiment } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import { getRecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import ExperimentDetailClient from "./ExperimentDetailClient";

interface ExperimentDetailPageProps {
  params: Promise<{ recipeId: string; experimentId: string }>;
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/auth");
  }

  const { recipeId, experimentId } = await params;

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

