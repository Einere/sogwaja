"use client";

import EquipmentEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/EquipmentEditor";
import IngredientEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/IngredientEditor";
import OutputEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/OutputEditor";
import StepEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/StepEditor";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";
import type { Descendant } from "slate";

type Equipment = Database["public"]["Tables"]["recipe_equipment"]["Row"];
type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
type Output = Database["public"]["Tables"]["recipe_outputs"]["Row"];

interface RecipeFormProps {
  recipeId: string;
  equipment: Equipment[];
  ingredients: Ingredient[];
  outputs: Output[];
  steps: Json | null;
  onEquipmentChange: (equipment: Equipment[]) => void;
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  onOutputsChange: (outputs: Output[]) => void;
  onStepsChange: (steps: { children: Descendant[] }) => void;
  onOutputQuantityChange: (
    quantity: number,
    unit: string,
    originalQuantity?: number,
    originalUnit?: string
  ) => void;
  user: { id: string } | null;
}

export default function RecipeForm({
  equipment,
  ingredients,
  outputs,
  steps,
  onEquipmentChange,
  onIngredientsChange,
  onOutputsChange,
  onStepsChange,
  onOutputQuantityChange,
}: RecipeFormProps) {
  const initialSteps: { children: Descendant[] } =
    steps && typeof steps === "object" && "children" in steps
      ? (steps as unknown as { children: Descendant[] })
      : {
          children: [{ type: "paragraph", children: [{ text: "" }] }] as unknown as Descendant[],
        };

  return (
    <div className="space-y-6 px-4 py-6">
      <EquipmentEditor
        equipment={equipment}
        onUpdate={onEquipmentChange}
        outputQuantity={outputs[0]?.quantity}
        outputUnit={outputs[0]?.unit}
      />

      <IngredientEditor
        ingredients={ingredients}
        onUpdate={onIngredientsChange}
        outputQuantity={outputs[0]?.quantity}
        outputUnit={outputs[0]?.unit}
      />

      <OutputEditor
        outputs={outputs}
        onUpdate={onOutputsChange}
        onQuantityChange={onOutputQuantityChange}
      />

      <section className="space-y-3" aria-labelledby="steps-heading">
        <h3 id="steps-heading" className="text-lg font-semibold">
          조리법 흐름
        </h3>
        <StepEditor
          value={initialSteps}
          onChange={onStepsChange}
          equipment={equipment}
          ingredients={ingredients}
        />
      </section>
    </div>
  );
}
