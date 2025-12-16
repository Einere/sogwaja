"use client";

import { useRecipeEditor } from "@/app/(recipe-editor)/recipes/[recipeId]/hooks/useRecipeEditor";
import type { RecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import RecipeHeader from "@/app/(recipe-editor)/recipes/[recipeId]/components/RecipeHeader";
import RecipeForm from "@/app/(recipe-editor)/recipes/[recipeId]/components/RecipeForm";

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
  const {
    equipment,
    ingredients,
    outputs,
    steps,
    title,
    saving,
    setTitle,
    setEquipment,
    setIngredients,
    setOutputs,
    setSteps,
    handleOutputQuantityChange,
  } = useRecipeEditor(recipeId, initialData);

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
