"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import {
  getRecipeData,
  updateEquipment,
  updateIngredients,
  updateOutputs,
  updateSteps,
  type RecipeData,
} from "../actions";
import { updateRecipeTitle } from "@/app/(recipes)/recipes/actions";
import { calculateIngredients, calculateEquipment, isValidNumber } from "@/lib/utils/calculations";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";
import type { Descendant } from "slate";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type Equipment = Database["public"]["Tables"]["recipe_equipment"]["Row"];
type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
type Output = Database["public"]["Tables"]["recipe_outputs"]["Row"];

// Auto-save debounce delay (ms)
const AUTO_SAVE_DEBOUNCE_MS = 2000;

interface UseRecipeEditorResult {
  recipe: Recipe | null;
  equipment: Equipment[];
  ingredients: Ingredient[];
  outputs: Output[];
  steps: Json | null;
  title: string;
  loading: boolean;
  error: string | null;
  saving: boolean;
  setTitle: (title: string) => void;
  setEquipment: (equipment: Equipment[]) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  setOutputs: (outputs: Output[]) => void;
  setSteps: (steps: { children: Descendant[] }) => void;
  handleOutputQuantityChange: (quantity: number, unit: string) => void;
  refresh: () => Promise<void>;
}

// TOOD: react-hook-form 으로 리팩토링?
export function useRecipeEditor(recipeId: string, initialData?: RecipeData): UseRecipeEditorResult {
  const [recipe, setRecipe] = useState<Recipe | null>(initialData?.recipe || null);
  const [equipment, setEquipment] = useState<Equipment[]>(initialData?.equipment || []);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData?.ingredients || []);
  const [outputs, setOutputs] = useState<Output[]>(initialData?.outputs || []);
  const [steps, setSteps] = useState<Json | null>(initialData?.steps || null);
  const [title, setTitle] = useState(initialData?.recipe.title || "");
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadRecipe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const recipeData = await getRecipeData(recipeId);
      setRecipe(recipeData.recipe);
      setTitle(recipeData.recipe.title);
      setEquipment(recipeData.equipment);
      setIngredients(recipeData.ingredients);
      setOutputs(recipeData.outputs);
      setSteps(recipeData.steps);
    } catch {
      setError("조리법을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    // Only load if initialData is not provided
    if (!initialData) {
      loadRecipe();
    }
  }, [loadRecipe, initialData]);

  // Save title with optimistic update
  const saveTitle = useCallback(
    async (newTitle: string) => {
      if (!recipe || newTitle === recipe.title) return;

      // 1. 이전 상태 저장 (롤백용)
      const previousRecipe = recipe;

      // 2. 즉시 UI 업데이트 (낙관적)
      setRecipe({ ...recipe, title: newTitle });
      setSaving(true);

      try {
        // 3. 백그라운드에서 서버 요청
        const updatedRecipe = await updateRecipeTitle(recipeId, newTitle);

        // 4. 성공 시 서버 응답으로 최종 동기화
        setRecipe(updatedRecipe);
      } catch (err) {
        // 5. 실패 시 롤백
        setRecipe(previousRecipe);
        console.error("Error saving title:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId]
  );

  // Debounced save title
  const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
    if (recipe && newTitle !== recipe.title) {
      saveTitle(newTitle);
    }
  }, AUTO_SAVE_DEBOUNCE_MS);

  // Auto-save title
  useEffect(() => {
    if (!recipe || title === recipe.title) return;
    debouncedSaveTitle(title);
  }, [title, recipe, debouncedSaveTitle]);

  // Save equipment with optimistic update
  const saveEquipment = useCallback(
    async (newEquipment: Equipment[]) => {
      if (!recipe) return;

      // 1. 이전 상태 저장 (롤백용)
      const previousEquipment = equipment;

      // 2. 즉시 UI 업데이트 (낙관적)
      setEquipment(newEquipment);
      setSaving(true);

      try {
        // 3. 백그라운드에서 서버 요청
        // 임시 ID를 가진 항목도 포함하되, ID 필드는 제거하여 서버로 전송
        const equipmentToSave = newEquipment.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...eq }) => eq
        );
        const updatedEquipment = await updateEquipment(recipeId, equipmentToSave);

        // 4. 성공 시 서버 응답으로 최종 동기화
        // 서버에서 받은 실제 ID를 사용하여 최종 동기화
        setEquipment(updatedEquipment);
      } catch (err) {
        // 5. 실패 시 롤백
        setEquipment(previousEquipment);
        console.error("Error saving equipment:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId, equipment]
  );

  // Save ingredients with optimistic update
  const saveIngredients = useCallback(
    async (newIngredients: Ingredient[]) => {
      if (!recipe) return;

      // 1. 이전 상태 저장 (롤백용)
      const previousIngredients = ingredients;

      // 2. 즉시 UI 업데이트 (낙관적)
      setIngredients(newIngredients);
      setSaving(true);

      try {
        // 3. 백그라운드에서 서버 요청
        // 임시 ID를 가진 항목도 포함하되, ID 필드는 제거하여 서버로 전송
        const ingredientsToSave = newIngredients.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...ing }) => ing
        );
        const updatedIngredients = await updateIngredients(recipeId, ingredientsToSave);

        // 4. 성공 시 서버 응답으로 최종 동기화
        // 서버에서 받은 실제 ID를 사용하여 최종 동기화
        setIngredients(updatedIngredients);
      } catch (err) {
        // 5. 실패 시 롤백
        setIngredients(previousIngredients);
        console.error("Error saving ingredients:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId, ingredients]
  );

  // Save outputs with optimistic update
  const saveOutputs = useCallback(
    async (newOutputs: Output[]) => {
      if (!recipe) return;

      // 1. 이전 상태 저장 (롤백용)
      const previousOutputs = outputs;

      // 2. 즉시 UI 업데이트 (낙관적)
      setOutputs(newOutputs);
      setSaving(true);

      try {
        // 3. 백그라운드에서 서버 요청
        // 임시 ID를 가진 항목도 포함하되, ID 필드는 제거하여 서버로 전송
        const outputsToSave = newOutputs.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...out }) => out
        );
        const updatedOutputs = await updateOutputs(recipeId, outputsToSave);

        // 4. 성공 시 서버 응답으로 최종 동기화
        // 서버에서 받은 실제 ID를 사용하여 최종 동기화
        setOutputs(updatedOutputs);
      } catch (err) {
        // 5. 실패 시 롤백
        setOutputs(previousOutputs);
        console.error("Error saving outputs:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId, outputs]
  );

  // Save steps with optimistic update
  const saveSteps = useCallback(
    async (newSteps: Json) => {
      if (!recipe) return;

      // 1. 이전 상태 저장 (롤백용)
      const previousSteps = steps;

      // 2. 즉시 UI 업데이트 (낙관적)
      setSteps(newSteps);
      setSaving(true);

      try {
        // 3. 백그라운드에서 서버 요청
        await updateSteps(recipeId, newSteps);

        // 4. 성공 시 서버 응답으로 최종 동기화 (steps는 서버에서 반환하지 않으므로 그대로 유지)
        // setSteps는 이미 낙관적 업데이트로 설정됨
      } catch (err) {
        // 5. 실패 시 롤백
        setSteps(previousSteps);
        console.error("Error saving steps:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId, steps]
  );

  // Debounced save functions
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

  // Auto-save handlers with debouncing
  const handleEquipmentChange = useCallback(
    (newEquipment: Equipment[]) => {
      setEquipment(newEquipment);
      debouncedSaveEquipment(newEquipment);
    },
    [debouncedSaveEquipment]
  );

  const handleIngredientsChange = useCallback(
    (newIngredients: Ingredient[]) => {
      setIngredients(newIngredients);
      debouncedSaveIngredients(newIngredients);
    },
    [debouncedSaveIngredients]
  );

  const handleOutputsChange = useCallback(
    (newOutputs: Output[]) => {
      setOutputs(newOutputs);
      debouncedSaveOutputs(newOutputs);
    },
    [debouncedSaveOutputs]
  );

  const handleStepsChange = useCallback(
    (newSteps: { children: Descendant[] }) => {
      const stepsJson = newSteps as unknown as Json;
      setSteps(stepsJson);
      debouncedSaveSteps(stepsJson);
    },
    [debouncedSaveSteps]
  );

  const handleOutputQuantityChange = useCallback(
    (quantity: number, unit: string) => {
      if (outputs.length === 0) return;

      const mainOutput = outputs[0];
      if (!mainOutput) return;

      // 입력값 검증: quantity가 유효한 number가 아니면 조기 반환
      if (!isValidNumber(quantity)) {
        return;
      }

      // originalOutput.value도 검증
      if (!isValidNumber(mainOutput.quantity)) {
        return;
      }

      const originalOutput = {
        value: mainOutput.quantity,
        unit: mainOutput.unit,
      };

      const newOutput = {
        value: quantity,
        unit: unit,
      };

      // Calculate new ingredient amounts
      const newIngredients = calculateIngredients(
        ingredients.map(ing => ({ amount: ing.amount, unit: ing.unit })),
        originalOutput,
        newOutput
      );

      // Calculate new equipment quantities
      const newEquipment = calculateEquipment(
        equipment.map(eq => ({ quantity: eq.quantity, unit: eq.unit })),
        originalOutput,
        newOutput
      );

      // Update ingredients with debounced save
      const updatedIngredients = ingredients.map((ing, index) => ({
        ...ing,
        amount: newIngredients[index]?.amount || ing.amount,
        unit: newIngredients[index]?.unit || ing.unit,
      }));
      handleIngredientsChange(updatedIngredients);

      // Update equipment with debounced save
      const updatedEquipment = equipment.map((eq, index) => ({
        ...eq,
        quantity: newEquipment[index]?.quantity || eq.quantity,
        unit: newEquipment[index]?.unit || eq.unit,
      }));
      handleEquipmentChange(updatedEquipment);
    },
    [outputs, ingredients, equipment, handleIngredientsChange, handleEquipmentChange]
  );

  return {
    recipe,
    equipment,
    ingredients,
    outputs,
    steps,
    title,
    loading,
    error,
    saving,
    setTitle,
    setEquipment: handleEquipmentChange,
    setIngredients: handleIngredientsChange,
    setOutputs: handleOutputsChange,
    setSteps: handleStepsChange,
    handleOutputQuantityChange,
    refresh: loadRecipe,
  };
}
