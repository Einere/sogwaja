import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import {
  getExperiment,
  getExperimentData,
} from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import ExperimentDetailClient from "./ExperimentDetailClient";
import { SsgoiTransition } from "@ssgoi/react";

interface ExperimentDetailPageProps {
  params: Promise<{ recipeId: string; experimentId: string }>;
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
  const user = await getServerUser();
  if (!user) {
    redirect("/auth");
  }

  const { recipeId, experimentId } = await params;

  const [experiment, experimentData] = await Promise.all([
    getExperiment(experimentId),
    getExperimentData(experimentId),
  ]);

  return (
    <ExperimentDetailClient
      experiment={experiment}
      recipe={experimentData.recipe}
      equipment={experimentData.equipment}
      ingredients={experimentData.ingredients}
      outputs={experimentData.outputs}
      steps={experimentData.steps}
      recipeId={recipeId}
      experimentId={experimentId}
    />
  );
}
