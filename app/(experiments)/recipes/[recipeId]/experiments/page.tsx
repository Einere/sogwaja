import type { Metadata } from "next";
import { getExperiments } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import { getRecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import ExperimentsClient from "./ExperimentsClient";

interface ExperimentsPageProps {
  params: Promise<{ recipeId: string }>;
}

export async function generateMetadata({
  params,
}: ExperimentsPageProps): Promise<Metadata> {
  const { recipeId } = await params;
  const recipeData = await getRecipeData(recipeId);

  return {
    title: `${recipeData.recipe.title} - 실험 목록`,
    description: `${recipeData.recipe.title} 조리법의 실험 결과를 확인하세요`,
  };
}

export default async function ExperimentsPage({ params }: ExperimentsPageProps) {
  const { recipeId } = await params;
  const experiments = await getExperiments(recipeId);

  return <ExperimentsClient experiments={experiments} recipeId={recipeId} />;
}
