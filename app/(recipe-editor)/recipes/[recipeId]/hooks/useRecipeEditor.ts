"use client";

import { useState, useEffect, useRef, useEffectEvent } from "react";
import { useForm, useFieldArray, useWatch, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "use-debounce";
import {
  updateEquipment,
  updateIngredients,
  updateOutputs,
  updateSteps,
  type RecipeData,
} from "../actions";
import { updateRecipeTitle } from "@/app/(recipes)/recipes/actions";
import {
  applyProportionalToIngredients,
  applyProportionalToEquipment,
  isValidNumber,
} from "@/lib/utils/calculations";
import {
  EquipmentFormData,
  IngredientFormData,
  OutputFormData,
  RecipeFormSchema,
  type RecipeFormData,
} from "@/lib/validations/recipe";
import type { Database, Json } from "@/types/database";
import type { Descendant } from "slate";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type Equipment = Database["public"]["Tables"]["recipe_equipment"]["Row"];
type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
type Output = Database["public"]["Tables"]["recipe_outputs"]["Row"];

const AUTO_SAVE_DEBOUNCE_MS = 2000;

// 서버 전송용 데이터 변환 유틸리티
const stripServerFields = <T extends { id?: string; recipe_id?: string; created_at?: string }>(
  item: T
): Omit<T, "id" | "recipe_id" | "created_at"> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, recipe_id: _recipe_id, created_at: _created_at, ...rest } = item;
  return rest;
};

// 초기값 생성 유틸리티
const createInitialValues = (initialData: RecipeData): RecipeFormData => ({
  title: initialData.recipe.title,
  ingredients: initialData.ingredients as IngredientFormData[],
  equipment: initialData.equipment as EquipmentFormData[],
  outputs: initialData.outputs as OutputFormData[],
  steps: initialData.steps,
});

interface UseRecipeEditorResult {
  recipe: Recipe | null;
  equipment: Equipment[];
  ingredients: Ingredient[];
  outputs: Output[];
  steps: Json | null;
  title: string;
  saving: boolean;
  setTitle: (title: string) => void;
  setEquipment: (equipment: Equipment[]) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setOutputs: (outputs: Output[]) => void;
  setSteps: (steps: { children: Descendant[] }) => void;
  handleOutputQuantityChange: (
    quantity: number,
    unit: string,
    originalQuantity?: number,
    originalUnit?: string
  ) => void;
  form: UseFormReturn<RecipeFormData>;
}

export function useRecipeEditor(recipeId: string, initialData: RecipeData): UseRecipeEditorResult {
  const [recipe, setRecipe] = useState<Recipe | null>(initialData.recipe);
  const [saving, setSaving] = useState(false);
  // TODO: 초기화 시 자동저장을 막기 위해 이런 복잡한 상태를 활용하는 것 보다, 조리법을 프로퍼티로 받는 방식을 사용하는게 어떨지?
  const isInitializingRef = useRef(true);

  const initialValues = createInitialValues(initialData);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: initialValues,
  });

  const { replace: replaceIngredients } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const { replace: replaceEquipment } = useFieldArray({
    control: form.control,
    name: "equipment",
  });

  const { replace: replaceOutputs } = useFieldArray({
    control: form.control,
    name: "outputs",
  });

  const watchedTitle = useWatch({ control: form.control, name: "title" });
  const watchedIngredients = useWatch({ control: form.control, name: "ingredients" });
  const watchedEquipment = useWatch({ control: form.control, name: "equipment" });
  const watchedOutputs = useWatch({ control: form.control, name: "outputs" });
  const watchedSteps = useWatch({ control: form.control, name: "steps" });

  const onFormReset = useEffectEvent((data: RecipeData) => {
    form.reset(createInitialValues(data));
  });

  useEffect(() => {
    onFormReset(initialData);
    isInitializingRef.current = true;
    setTimeout(() => {
      isInitializingRef.current = false;
    }, 100);
  }, [initialData]);

  const saveTitle = async (newTitle: string) => {
    if (!recipe || newTitle === recipe.title) return;

    const previousRecipe = recipe;
    setRecipe({ ...recipe, title: newTitle });
    setSaving(true);

    try {
      const updatedRecipe = await updateRecipeTitle(recipeId, newTitle);
      setRecipe(updatedRecipe);
    } catch (err) {
      setRecipe(previousRecipe);
      form.setValue("title", previousRecipe.title, { shouldDirty: false });
      console.error("Error saving title:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveEquipment = async (newEquipment: Equipment[]) => {
    if (!recipe || isInitializingRef.current) return;

    const previousEquipment = form.getValues("equipment");
    replaceEquipment(newEquipment as EquipmentFormData[]);
    setSaving(true);

    try {
      const equipmentToSave = newEquipment.map(stripServerFields);
      const updatedEquipment = await updateEquipment(recipeId, equipmentToSave);
      replaceEquipment(updatedEquipment as EquipmentFormData[]);
    } catch (err) {
      replaceEquipment(previousEquipment as EquipmentFormData[]);
      console.error("Error saving equipment:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveIngredients = async (newIngredients: Ingredient[]) => {
    if (!recipe || isInitializingRef.current) return;

    const previousIngredients = form.getValues("ingredients");
    replaceIngredients(newIngredients as IngredientFormData[]);
    setSaving(true);

    try {
      const ingredientsToSave = newIngredients.map(stripServerFields);
      const updatedIngredients = await updateIngredients(recipeId, ingredientsToSave);
      replaceIngredients(updatedIngredients as IngredientFormData[]);
    } catch (err) {
      replaceIngredients(previousIngredients as IngredientFormData[]);
      console.error("Error saving ingredients:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveOutputs = async (newOutputs: Output[]) => {
    if (!recipe || isInitializingRef.current) return;

    const previousOutputs = form.getValues("outputs");
    replaceOutputs(newOutputs as OutputFormData[]);
    setSaving(true);

    try {
      const outputsToSave = newOutputs.map(stripServerFields);
      const updatedOutputs = await updateOutputs(recipeId, outputsToSave);
      replaceOutputs(updatedOutputs as OutputFormData[]);
    } catch (err) {
      replaceOutputs(previousOutputs as OutputFormData[]);
      console.error("Error saving outputs:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveSteps = async (newSteps: Json) => {
    if (!recipe || isInitializingRef.current) return;

    const previousSteps = form.getValues("steps");
    form.setValue("steps", newSteps, { shouldDirty: true });
    setSaving(true);

    try {
      await updateSteps(recipeId, newSteps);
    } catch (err) {
      form.setValue("steps", previousSteps, { shouldDirty: false });
      console.error("Error saving steps:", err);
    } finally {
      setSaving(false);
    }
  };

  // Debounced save functions
  const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
    if (recipe && newTitle !== recipe.title && !isInitializingRef.current) {
      saveTitle(newTitle);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveEquipment = useDebouncedCallback((newEquipment: Equipment[]) => {
    if (recipe && !isInitializingRef.current) {
      saveEquipment(newEquipment);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveIngredients = useDebouncedCallback((newIngredients: Ingredient[]) => {
    if (recipe && !isInitializingRef.current) {
      saveIngredients(newIngredients);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveOutputs = useDebouncedCallback((newOutputs: Output[]) => {
    if (recipe && !isInitializingRef.current) {
      saveOutputs(newOutputs);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveSteps = useDebouncedCallback((newSteps: Json) => {
    if (recipe && !isInitializingRef.current) {
      saveSteps(newSteps);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  // Change handlers
  const handleEquipmentChange = (newEquipment: Equipment[]) => {
    replaceEquipment(newEquipment as EquipmentFormData[]);
    debouncedSaveEquipment(newEquipment);
  };

  const handleIngredientsChange = (newIngredients: Ingredient[]) => {
    replaceIngredients(newIngredients as IngredientFormData[]);
    debouncedSaveIngredients(newIngredients);
  };

  const handleOutputsChange = (newOutputs: Output[]) => {
    replaceOutputs(newOutputs as OutputFormData[]);
    debouncedSaveOutputs(newOutputs);
  };

  const handleStepsChange = (newSteps: { children: Descendant[] }) => {
    const stepsJson = newSteps as unknown as Json;
    form.setValue("steps", stepsJson, { shouldDirty: true });
    debouncedSaveSteps(stepsJson);
  };

  const handleOutputQuantityChange = (
    quantity: number,
    unit: string,
    originalQuantity?: number,
    originalUnit?: string
  ) => {
    if (!isValidNumber(quantity)) return;

    // 원래 값 결정
    const originalOutput = (() => {
      if (
        originalQuantity !== undefined &&
        originalUnit !== undefined &&
        isValidNumber(originalQuantity)
      ) {
        return { value: originalQuantity, unit: originalUnit };
      }

      // watchedOutputs는 항상 최신 값이므로 직접 사용
      if (watchedOutputs.length === 0) return null;

      const mainOutput = watchedOutputs[0];
      if (!mainOutput || !isValidNumber(mainOutput.quantity)) return null;

      return { value: mainOutput.quantity, unit: mainOutput.unit };
    })();

    if (!originalOutput) return;

    const newOutput = { value: quantity, unit };

    // 한 번의 루프로 처리 - watched 값은 항상 최신이므로 직접 사용
    const updatedIngredients = applyProportionalToIngredients(
      watchedIngredients,
      originalOutput,
      newOutput
    );

    const updatedEquipment = applyProportionalToEquipment(
      watchedEquipment,
      originalOutput,
      newOutput
    );

    handleIngredientsChange(updatedIngredients);
    handleEquipmentChange(updatedEquipment);
  };

  const setTitle = (newTitle: string) => {
    form.setValue("title", newTitle, { shouldDirty: true });
    debouncedSaveTitle(newTitle);
  };

  return {
    recipe,
    equipment: watchedEquipment,
    ingredients: watchedIngredients,
    outputs: watchedOutputs,
    steps: watchedSteps,
    title: watchedTitle,
    saving,
    setTitle,
    setEquipment: handleEquipmentChange,
    setIngredients: handleIngredientsChange,
    setOutputs: handleOutputsChange,
    setSteps: handleStepsChange,
    handleOutputQuantityChange,
    form,
  };
}
