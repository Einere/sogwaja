import type { Metadata } from "next";
import {
  getExperiment,
  getExperimentData,
} from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import ExperimentDetailClient from "./ExperimentDetailClient";

interface ExperimentDetailPageProps {
  params: Promise<{ recipeId: string; experimentId: string }>;
}

export async function generateMetadata({
  params,
}: ExperimentDetailPageProps): Promise<Metadata> {
  const { experimentId } = await params;
  const experimentData = await getExperimentData(experimentId);

  return {
    title: `${experimentData.recipe.title} - 실험 결과`,
    description: `${experimentData.recipe.title} 조리법의 실험 결과를 확인하세요`,
  };
}

export default async function ExperimentDetailPage({ params }: ExperimentDetailPageProps) {
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
