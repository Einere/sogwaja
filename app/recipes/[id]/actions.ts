'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'
import type { Json } from '@/types/database'

type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeData {
  recipe: Recipe
  equipment: Equipment[]
  ingredients: Ingredient[]
  outputs: Output[]
  steps: Json | null
}

interface ActionResult<T> {
  data?: T
  error?: string
}

export async function getRecipeData(id: string): Promise<ActionResult<RecipeData>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Load recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (recipeError) {
      return { error: recipeError.message }
    }

    if (!recipeData) {
      return { error: '조리법을 찾을 수 없습니다.' }
    }

    // Load equipment
    const { data: equipmentData } = await supabase
      .from('recipe_equipment')
      .select('*')
      .eq('recipe_id', id)
      .order('created_at')

    // Load ingredients
    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('created_at')

    // Load outputs
    const { data: outputsData } = await supabase
      .from('recipe_outputs')
      .select('*')
      .eq('recipe_id', id)
      .order('created_at')

    // Load steps
    const { data: stepsData } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', id)
      .maybeSingle()

    return {
      data: {
        recipe: recipeData,
        equipment: equipmentData || [],
        ingredients: ingredientsData || [],
        outputs: outputsData || [],
        steps: stepsData?.content || null,
      },
    }
  } catch (error) {
    console.error('Unexpected error getting recipe data:', error)
    return { error: '조리법 데이터 조회 중 오류가 발생했습니다.' }
  }
}

export async function updateEquipment(
  recipeId: string,
  equipment: Omit<Equipment, 'recipe_id' | 'created_at'>[]
): Promise<ActionResult<Equipment[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Delete all existing equipment
    await supabase.from('recipe_equipment').delete().eq('recipe_id', recipeId)

    // Insert new equipment (filter out temp IDs)
    const equipmentToInsert = equipment
      .filter((eq) => !eq.id.startsWith('temp-'))
      .map(({ id, ...eq }) => ({
        ...eq,
        recipe_id: recipeId,
      }))

    const newEquipment = equipment.filter((eq) => eq.id.startsWith('temp-'))
    const allEquipment = [
      ...equipmentToInsert,
      ...newEquipment.map(({ id, ...eq }) => ({
        ...eq,
        recipe_id: recipeId,
      })),
    ]

    if (allEquipment.length > 0) {
      const { data, error } = await supabase
        .from('recipe_equipment')
        .insert(allEquipment)
        .select()
        .order('created_at')

      if (error) {
        return { error: error.message }
      }

      revalidatePath(`/recipes/${recipeId}`)
      return { data: data || [] }
    }

    revalidatePath(`/recipes/${recipeId}`)
    return { data: [] }
  } catch (error) {
    console.error('Unexpected error updating equipment:', error)
    return { error: '장비 업데이트 중 오류가 발생했습니다.' }
  }
}

export async function updateIngredients(
  recipeId: string,
  ingredients: Omit<Ingredient, 'recipe_id' | 'created_at'>[]
): Promise<ActionResult<Ingredient[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Delete all existing ingredients
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

    // Insert new ingredients
    const ingredientsToInsert = ingredients
      .filter((ing) => !ing.id.startsWith('temp-'))
      .map(({ id, ...ing }) => ({
        ...ing,
        recipe_id: recipeId,
      }))

    const newIngredients = ingredients.filter((ing) => ing.id.startsWith('temp-'))
    const allIngredients = [
      ...ingredientsToInsert,
      ...newIngredients.map(({ id, ...ing }) => ({
        ...ing,
        recipe_id: recipeId,
      })),
    ]

    if (allIngredients.length > 0) {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .insert(allIngredients)
        .select()
        .order('created_at')

      if (error) {
        return { error: error.message }
      }

      revalidatePath(`/recipes/${recipeId}`)
      return { data: data || [] }
    }

    revalidatePath(`/recipes/${recipeId}`)
    return { data: [] }
  } catch (error) {
    console.error('Unexpected error updating ingredients:', error)
    return { error: '재료 업데이트 중 오류가 발생했습니다.' }
  }
}

export async function updateOutputs(
  recipeId: string,
  outputs: Omit<Output, 'recipe_id' | 'created_at'>[]
): Promise<ActionResult<Output[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Delete all existing outputs
    await supabase.from('recipe_outputs').delete().eq('recipe_id', recipeId)

    // Insert new outputs
    const outputsToInsert = outputs
      .filter((out) => !out.id.startsWith('temp-'))
      .map(({ id, ...out }) => ({
        ...out,
        recipe_id: recipeId,
      }))

    const newOutputs = outputs.filter((out) => out.id.startsWith('temp-'))
    const allOutputs = [
      ...outputsToInsert,
      ...newOutputs.map(({ id, ...out }) => ({
        ...out,
        recipe_id: recipeId,
      })),
    ]

    if (allOutputs.length > 0) {
      const { data, error } = await supabase
        .from('recipe_outputs')
        .insert(allOutputs)
        .select()
        .order('created_at')

      if (error) {
        return { error: error.message }
      }

      revalidatePath(`/recipes/${recipeId}`)
      return { data: data || [] }
    }

    revalidatePath(`/recipes/${recipeId}`)
    return { data: [] }
  } catch (error) {
    console.error('Unexpected error updating outputs:', error)
    return { error: '결과물 업데이트 중 오류가 발생했습니다.' }
  }
}

export async function updateSteps(
  recipeId: string,
  steps: Json
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Check if step record exists
    const { data: existingStep, error: selectError } = await supabase
      .from('recipe_steps')
      .select('id')
      .eq('recipe_id', recipeId)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      return { error: selectError.message }
    }

    if (existingStep) {
      // Update existing record
      const { error } = await supabase
        .from('recipe_steps')
        .update({ content: steps })
        .eq('id', existingStep.id)

      if (error) {
        return { error: error.message }
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('recipe_steps')
        .insert({
          recipe_id: recipeId,
          content: steps,
        })

      if (error) {
        return { error: error.message }
      }
    }

    revalidatePath(`/recipes/${recipeId}`)
    return { data: undefined }
  } catch (error) {
    console.error('Unexpected error updating steps:', error)
    return { error: '조리법 흐름 업데이트 중 오류가 발생했습니다.' }
  }
}

