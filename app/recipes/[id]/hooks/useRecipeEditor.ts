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
import { updateRecipeTitle } from "../../actions";
import { calculateIngredients, calculateEquipment } from "@/lib/utils/calculations";
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
    } catch (err) {
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

  // Save title
  const saveTitle = useCallback(
    async (newTitle: string) => {
      if (!recipe || newTitle === recipe.title) return;

      setSaving(true);
      try {
        const updatedRecipe = await updateRecipeTitle(recipeId, newTitle);
        setRecipe(updatedRecipe);
      } catch (err) {
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

  // Save equipment
  const saveEquipment = useCallback(
    async (newEquipment: Equipment[]) => {
      if (!recipe) return;
      setSaving(true);
      try {
        const equipmentToSave = newEquipment.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...eq }) => eq
        );
        const updatedEquipment = await updateEquipment(recipeId, equipmentToSave);
        setEquipment(updatedEquipment);
      } catch (err) {
        console.error("Error saving equipment:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId]
  );

  // Save ingredients
  const saveIngredients = useCallback(
    async (newIngredients: Ingredient[]) => {
      if (!recipe) return;
      setSaving(true);
      try {
        const ingredientsToSave = newIngredients.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...ing }) => ing
        );
        const updatedIngredients = await updateIngredients(recipeId, ingredientsToSave);
        setIngredients(updatedIngredients);
      } catch (err) {
        console.error("Error saving ingredients:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId]
  );

  // Save outputs
  const saveOutputs = useCallback(
    async (newOutputs: Output[]) => {
      if (!recipe) return;
      setSaving(true);
      try {
        const outputsToSave = newOutputs.map(
          ({ created_at: _created_at, recipe_id: _recipe_id, ...out }) => out
        );
        const updatedOutputs = await updateOutputs(recipeId, outputsToSave);
        setOutputs(updatedOutputs);
      } catch (err) {
        console.error("Error saving outputs:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId]
  );

  // Save steps
  const saveSteps = useCallback(
    async (newSteps: Json) => {
      if (!recipe) return;
      setSaving(true);
      try {
        await updateSteps(recipeId, newSteps);
        setSteps(newSteps);
      } catch (err) {
        console.error("Error saving steps:", err);
      } finally {
        setSaving(false);
      }
    },
    [recipe, recipeId]
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
