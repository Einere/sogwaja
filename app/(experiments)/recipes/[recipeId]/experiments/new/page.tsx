import type { Metadata } from "next";
import NewExperimentClient from "./NewExperimentClient";

interface NewExperimentPageProps {
  params: Promise<{ recipeId: string }>;
}

export const metadata: Metadata = {
  title: "실험 결과 저장",
  description: "새로운 실험 결과를 저장하세요",
};

export default async function NewExperimentPage({ params }: NewExperimentPageProps) {
  const { recipeId } = await params;

  return <NewExperimentClient recipeId={recipeId} />;
}
