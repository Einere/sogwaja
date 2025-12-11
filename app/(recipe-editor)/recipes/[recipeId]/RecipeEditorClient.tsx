"use client";

import { useRouter } from "next/navigation";
import { useRecipeEditor } from "@/app/(recipe-editor)/recipes/[recipeId]/hooks/useRecipeEditor";
import type { RecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import RecipeHeader from "@/app/(recipe-editor)/recipes/[recipeId]/components/RecipeHeader";
import RecipeForm from "@/app/(recipe-editor)/recipes/[recipeId]/components/RecipeForm";
import ErrorMessage from "@/components/shared/ErrorMessage";

interface RecipeEditorClientProps {
  initialData: RecipeData;
  recipeId: string;
  user: { id: string };
}

export default function RecipeEditorClient({
  initialData,
  recipeId,
  user,
}: RecipeEditorClientProps) {
  const router = useRouter();
  const {
    equipment,
    ingredients,
    outputs,
    steps,
    title,
    error,
    saving,
    setTitle,
    setEquipment,
    setIngredients,
    setOutputs,
    setSteps,
    handleOutputQuantityChange,
  } = useRecipeEditor(recipeId, initialData);

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => router.push("/recipes")}
        retryLabel="목록으로 돌아가기"
      />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <RecipeHeader title={title} onTitleChange={setTitle} saving={saving} />
      <RecipeForm
        recipeId={recipeId}
        equipment={equipment}
        ingredients={ingredients}
        outputs={outputs}
        steps={steps}
        onEquipmentChange={setEquipment}
        onIngredientsChange={setIngredients}
        onOutputsChange={setOutputs}
        onStepsChange={setSteps}
        onOutputQuantityChange={handleOutputQuantityChange}
        user={user}
      />
    </div>
  );
}
