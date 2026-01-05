"use client";

import { useState, useEffect, useRef } from "react";
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
import type { Unit } from "@/lib/constants/recipe";

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

// 배열 비교를 위한 헬퍼 함수 (성능 최적화)
// 서버 필드(id, recipe_id, created_at)를 제외하고 비교
const areArraysEqual = <T extends Record<string, unknown>>(
  a: T[] | null | undefined,
  b: T[] | null | undefined
): boolean => {
  if (a === null || a === undefined || b === null || b === undefined) return a === b;
  if (a === b) return true; // 같은 참조면 true
  if (a.length !== b.length) return false;

  // 각 요소를 직접 비교 (서버 필드 제외)
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i] as Record<string, unknown>;
    const itemB = b[i] as Record<string, unknown>;

    // 서버 필드 제외하고 비교
    const { id: _idA, recipe_id: _recipeIdA, created_at: _createdAtA, ...restA } = itemA;
    const { id: _idB, recipe_id: _recipeIdB, created_at: _createdAtB, ...restB } = itemB;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = { _idA, _recipeIdA, _createdAtA, _idB, _recipeIdB, _createdAtB };

    if (JSON.stringify(restA) !== JSON.stringify(restB)) return false;
  }

  return true;
};

// Json (steps) 비교를 위한 헬퍼 함수
const isJsonEqual = (a: Json | null | undefined, b: Json | null | undefined): boolean => {
  if (a === null || a === undefined || b === null || b === undefined) return a === b;
  if (a === b) return true; // 같은 참조면 true
  return JSON.stringify(a) === JSON.stringify(b);
};

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
    unit: Unit,
    originalQuantity?: number,
    originalUnit?: Unit
  ) => void;
  form: UseFormReturn<RecipeFormData>;
}

export function useRecipeEditor(recipeId: string, initialData: RecipeData): UseRecipeEditorResult {
  const [recipe, setRecipe] = useState<Recipe | null>(initialData.recipe);
  const [saving, setSaving] = useState(false);

  const initialValues = createInitialValues(initialData);
  const prevRecipeIdRef = useRef(recipeId);

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

  // recipeId가 변경될 때 form reset하여 초기값 업데이트
  useEffect(() => {
    if (prevRecipeIdRef.current !== recipeId) {
      prevRecipeIdRef.current = recipeId;
      form.reset(createInitialValues(initialData));
    }
  }, [recipeId, initialData, form]);

  const saveTitle = async (newTitle: string) => {
    if (!recipe) return;

    // 현재 form의 defaultValues와 비교하여 변경이 없으면 저장하지 않음
    const currentDefaultTitle = form.formState.defaultValues?.title;
    if (currentDefaultTitle === newTitle) return;

    const previousRecipe = recipe;
    setRecipe({ ...recipe, title: newTitle });
    setSaving(true);

    try {
      const updatedRecipe = await updateRecipeTitle(recipeId, newTitle);
      setRecipe(updatedRecipe);
      // 저장 성공 시 resetField로 해당 필드만 초기값 업데이트 (다른 필드는 영향 없음)
      form.resetField("title", { defaultValue: newTitle });
    } catch (err) {
      setRecipe(previousRecipe);
      form.setValue("title", previousRecipe.title, { shouldDirty: false });
      console.error("Error saving title:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveEquipment = async (newEquipment: Equipment[]) => {
    if (!recipe) return;

    // 현재 form의 defaultValues와 비교하여 변경이 없으면 저장하지 않음
    const currentDefaultEquipment = form.formState.defaultValues?.equipment;
    if (areArraysEqual(currentDefaultEquipment as Equipment[] | null, newEquipment)) return;

    const previousEquipment = form.getValues("equipment");
    replaceEquipment(newEquipment as EquipmentFormData[]);
    setSaving(true);

    try {
      const equipmentToSave = newEquipment.map(stripServerFields);
      const updatedEquipment = await updateEquipment(recipeId, equipmentToSave);
      replaceEquipment(updatedEquipment as EquipmentFormData[]);
      // 저장 성공 시 resetField로 해당 필드만 초기값 업데이트 (다른 필드는 영향 없음)
      form.resetField("equipment", { defaultValue: updatedEquipment as EquipmentFormData[] });
    } catch (err) {
      replaceEquipment(previousEquipment as EquipmentFormData[]);
      console.error("Error saving equipment:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveIngredients = async (newIngredients: Ingredient[]) => {
    if (!recipe) return;

    // 현재 form의 defaultValues와 비교하여 변경이 없으면 저장하지 않음
    const currentDefaultIngredients = form.formState.defaultValues?.ingredients;
    if (areArraysEqual(currentDefaultIngredients as Ingredient[] | null, newIngredients)) return;

    const previousIngredients = form.getValues("ingredients");
    replaceIngredients(newIngredients as IngredientFormData[]);
    setSaving(true);

    try {
      const ingredientsToSave = newIngredients.map(stripServerFields);
      const updatedIngredients = await updateIngredients(recipeId, ingredientsToSave);
      replaceIngredients(updatedIngredients as IngredientFormData[]);
      // 저장 성공 시 resetField로 해당 필드만 초기값 업데이트 (다른 필드는 영향 없음)
      form.resetField("ingredients", { defaultValue: updatedIngredients as IngredientFormData[] });
    } catch (err) {
      replaceIngredients(previousIngredients as IngredientFormData[]);
      console.error("Error saving ingredients:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveOutputs = async (newOutputs: Output[]) => {
    if (!recipe) return;

    // 현재 form의 defaultValues와 비교하여 변경이 없으면 저장하지 않음
    const currentDefaultOutputs = form.formState.defaultValues?.outputs;
    if (areArraysEqual(currentDefaultOutputs as Output[] | null, newOutputs)) return;

    const previousOutputs = form.getValues("outputs");
    replaceOutputs(newOutputs as OutputFormData[]);
    setSaving(true);

    try {
      const outputsToSave = newOutputs.map(stripServerFields);
      const updatedOutputs = await updateOutputs(recipeId, outputsToSave);
      replaceOutputs(updatedOutputs as OutputFormData[]);
      // 저장 성공 시 resetField로 해당 필드만 초기값 업데이트 (다른 필드는 영향 없음)
      form.resetField("outputs", { defaultValue: updatedOutputs as OutputFormData[] });
    } catch (err) {
      replaceOutputs(previousOutputs as OutputFormData[]);
      console.error("Error saving outputs:", err);
    } finally {
      setSaving(false);
    }
  };

  const saveSteps = async (newSteps: Json) => {
    if (!recipe) return;

    // 현재 form의 defaultValues와 비교하여 변경이 없으면 저장하지 않음
    const currentDefaultSteps = form.formState.defaultValues?.steps;
    if (isJsonEqual(currentDefaultSteps, newSteps)) return;

    const previousSteps = form.getValues("steps");
    form.setValue("steps", newSteps, { shouldDirty: true });
    setSaving(true);

    try {
      await updateSteps(recipeId, newSteps);
      // 저장 성공 시 resetField로 해당 필드만 초기값 업데이트 (다른 필드는 영향 없음)
      form.resetField("steps", { defaultValue: newSteps });
    } catch (err) {
      form.setValue("steps", previousSteps, { shouldDirty: false });
      console.error("Error saving steps:", err);
    } finally {
      setSaving(false);
    }
  };

  // Debounced save functions
  const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
    if (recipe && newTitle !== recipe.title) {
      saveTitle(newTitle);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveEquipment = useDebouncedCallback((newEquipment: Equipment[]) => {
    if (recipe) {
      saveEquipment(newEquipment);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveIngredients = useDebouncedCallback((newIngredients: Ingredient[]) => {
    if (recipe) {
      saveIngredients(newIngredients);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveOutputs = useDebouncedCallback((newOutputs: Output[]) => {
    if (recipe) {
      saveOutputs(newOutputs);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  const debouncedSaveSteps = useDebouncedCallback((newSteps: Json) => {
    if (recipe) {
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
    unit: Unit,
    originalQuantity?: number,
    originalUnit?: Unit
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
