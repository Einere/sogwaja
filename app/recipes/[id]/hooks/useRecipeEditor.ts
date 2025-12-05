'use client'

import { useState, useEffect, useCallback } from 'react'
import { getRecipeData, updateEquipment, updateIngredients, updateOutputs, updateSteps } from '../actions'
import { updateRecipeTitle } from '../../actions'
import { calculateIngredients, calculateEquipment } from '@/lib/utils/calculations'
import type { Database } from '@/types/database'
import type { Json } from '@/types/database'
import type { Descendant } from 'slate'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']

interface UseRecipeEditorResult {
  recipe: Recipe | null
  equipment: Equipment[]
  ingredients: Ingredient[]
  outputs: Output[]
  steps: Json | null
  title: string
  loading: boolean
  error: string | null
  saving: boolean
  setTitle: (title: string) => void
  setEquipment: (equipment: Equipment[]) => void
  setIngredients: (ingredients: Ingredient[]) => void
  setOutputs: (outputs: Output[]) => void
  setSteps: (steps: { children: Descendant[] }) => void
  handleOutputQuantityChange: (quantity: number, unit: string) => void
  refresh: () => Promise<void>
}

export function useRecipeEditor(recipeId: string): UseRecipeEditorResult {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  const [steps, setSteps] = useState<Json | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadRecipe = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getRecipeData(recipeId)
      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data) {
        setRecipe(result.data.recipe)
        setTitle(result.data.recipe.title)
        setEquipment(result.data.equipment)
        setIngredients(result.data.ingredients)
        setOutputs(result.data.outputs)
        setSteps(result.data.steps)
      }
    } catch (err) {
      setError('조리법을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [recipeId])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  // Save title
  const saveTitle = useCallback(async (newTitle: string) => {
    if (!recipe || newTitle === recipe.title) return

    setSaving(true)
    try {
      const result = await updateRecipeTitle(recipeId, newTitle)
      if (result.error) {
        console.error('Error saving title:', result.error)
        return
      }
      if (result.data) {
        setRecipe(result.data)
      }
    } catch (err) {
      console.error('Error saving title:', err)
    } finally {
      setSaving(false)
    }
  }, [recipe, recipeId])

  // Auto-save title
  useEffect(() => {
    if (!recipe || title === recipe.title) return
    const timeoutId = setTimeout(() => {
      saveTitle(title)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [title, recipe, saveTitle])

  // Save equipment
  const saveEquipment = useCallback(async (newEquipment: Equipment[]) => {
    if (!recipe) return
    setSaving(true)
    try {
      const equipmentToSave = newEquipment.map(({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...eq }) => eq)
      const result = await updateEquipment(recipeId, equipmentToSave)
      if (result.error) {
        console.error('Error saving equipment:', result.error)
        return
      }
      if (result.data) {
        setEquipment(result.data)
      }
    } catch (err) {
      console.error('Error saving equipment:', err)
    } finally {
      setSaving(false)
    }
  }, [recipe, recipeId])

  // Save ingredients
  const saveIngredients = useCallback(async (newIngredients: Ingredient[]) => {
    if (!recipe) return
    setSaving(true)
    try {
      const ingredientsToSave = newIngredients.map(({ created_at: _created_at, recipe_id: _recipe_id, id: _id, ...ing }) => ing)
      const result = await updateIngredients(recipeId, ingredientsToSave)
      if (result.error) {
        console.error('Error saving ingredients:', result.error)
        return
      }
      if (result.data) {
        setIngredients(result.data)
      }
    } catch (err) {
      console.error('Error saving ingredients:', err)
    } finally {
      setSaving(false)
    }
  }, [recipe, recipeId])

  // Save outputs
  const saveOutputs = useCallback(async (newOutputs: Output[]) => {
    if (!recipe) return
    setSaving(true)
    try {
      const outputsToSave = newOutputs.map(({ created_at: _created_at, recipe_id: _recipe_id, ...out }) => out)
      const result = await updateOutputs(recipeId, outputsToSave)
      if (result.error) {
        console.error('Error saving outputs:', result.error)
        return
      }
      if (result.data) {
        setOutputs(result.data)
      }
    } catch (err) {
      console.error('Error saving outputs:', err)
    } finally {
      setSaving(false)
    }
  }, [recipe, recipeId])

  // Save steps
  const saveSteps = useCallback(async (newSteps: Json) => {
    if (!recipe) return
    setSaving(true)
    try {
      const result = await updateSteps(recipeId, newSteps)
      if (result.error) {
        console.error('Error saving steps:', result.error)
        return
      }
      setSteps(newSteps)
    } catch (err) {
      console.error('Error saving steps:', err)
    } finally {
      setSaving(false)
    }
  }, [recipe, recipeId])

  // Auto-save handlers with debouncing
  const handleEquipmentChange = useCallback((newEquipment: Equipment[]) => {
    setEquipment(newEquipment)
    const timeoutId = setTimeout(() => {
      saveEquipment(newEquipment)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveEquipment])

  const handleIngredientsChange = useCallback((newIngredients: Ingredient[]) => {
    setIngredients(newIngredients)
    const timeoutId = setTimeout(() => {
      saveIngredients(newIngredients)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveIngredients])

  const handleOutputsChange = useCallback((newOutputs: Output[]) => {
    setOutputs(newOutputs)
    const timeoutId = setTimeout(() => {
      saveOutputs(newOutputs)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveOutputs])

  const handleStepsChange = useCallback((newSteps: { children: Descendant[] }) => {
    setSteps(newSteps as unknown as Json)
    const timeoutId = setTimeout(() => {
      saveSteps(newSteps as unknown as Json)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [saveSteps])

  const handleOutputQuantityChange = useCallback((quantity: number, unit: string) => {
    if (outputs.length === 0) return

    const mainOutput = outputs[0]
    if (!mainOutput) return

    const originalOutput = {
      value: mainOutput.quantity,
      unit: mainOutput.unit,
    }

    const newOutput = {
      value: quantity,
      unit: unit,
    }

    // Calculate new ingredient amounts
    const newIngredients = calculateIngredients(
      ingredients.map((ing) => ({ amount: ing.amount, unit: ing.unit })),
      originalOutput,
      newOutput
    )

    // Calculate new equipment quantities
    const newEquipment = calculateEquipment(
      equipment.map((eq) => ({ quantity: eq.quantity, unit: eq.unit })),
      originalOutput,
      newOutput
    )

    // Update ingredients
    setIngredients(
      ingredients.map((ing, index) => ({
        ...ing,
        amount: newIngredients[index]?.amount || ing.amount,
        unit: newIngredients[index]?.unit || ing.unit,
      }))
    )

    // Update equipment
    setEquipment(
      equipment.map((eq, index) => ({
        ...eq,
        quantity: newEquipment[index]?.quantity || eq.quantity,
        unit: newEquipment[index]?.unit || eq.unit,
      }))
    )
  }, [outputs, ingredients, equipment])

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
  }
}

