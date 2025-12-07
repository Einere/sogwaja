'use server'

import { createClient } from '@/lib/supabase/server'
import { requireServerUser } from '@/lib/supabase/auth'
import { AuthorizationError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'
import type { Json } from '@/types/database'

type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']

export interface RecipeData {
  recipe: Recipe
  equipment: Equipment[]
  ingredients: Ingredient[]
  outputs: Output[]
  steps: Json | null
}

export async function getRecipeData(id: string): Promise<RecipeData> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Load recipe
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (recipeError) {
    throw new Error(recipeError.message)
  }

  if (!recipeData) {
    notFound()
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
    recipe: recipeData,
    equipment: equipmentData || [],
    ingredients: ingredientsData || [],
    outputs: outputsData || [],
    steps: stepsData?.content || null,
  }
}

export async function updateEquipment(
  recipeId: string,
  equipment: Omit<Equipment, 'recipe_id' | 'created_at' | 'id'>[]
): Promise<Equipment[]> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    throw new AuthorizationError()
  }

  // Delete all existing equipment
  await supabase.from('recipe_equipment').delete().eq('recipe_id', recipeId)

  // Insert new equipment
  const allEquipment = equipment.map((eq) => ({
    ...eq,
    recipe_id: recipeId,
  }))

  if (allEquipment.length > 0) {
    const { data, error } = await supabase
      .from('recipe_equipment')
      .insert(allEquipment)
      .select()
      .order('created_at')

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(`/recipes/${recipeId}`)
    return data || []
  }

  revalidatePath(`/recipes/${recipeId}`)
  return []
}

export async function updateIngredients(
  recipeId: string,
  ingredients: Omit<Ingredient, 'recipe_id' | 'created_at' | 'id'>[]
): Promise<Ingredient[]> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    throw new AuthorizationError()
  }

  // Delete all existing ingredients
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId)

  // Insert new ingredients
  const allIngredients = ingredients.map((ing) => ({
    ...ing,
    recipe_id: recipeId,
  }))

  if (allIngredients.length > 0) {
    const { data, error } = await supabase
      .from('recipe_ingredients')
      .insert(allIngredients)
      .select()
      .order('created_at')

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(`/recipes/${recipeId}`)
    return data || []
  }

  revalidatePath(`/recipes/${recipeId}`)
  return []
}

export async function updateOutputs(
  recipeId: string,
  outputs: Omit<Output, 'recipe_id' | 'created_at' | 'id'>[]
): Promise<Output[]> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    throw new AuthorizationError()
  }

  // Delete all existing outputs
  await supabase.from('recipe_outputs').delete().eq('recipe_id', recipeId)

  // Insert new outputs
  const allOutputs = outputs.map((out) => ({
    ...out,
    recipe_id: recipeId,
  }))

  if (allOutputs.length > 0) {
    const { data, error } = await supabase
      .from('recipe_outputs')
      .insert(allOutputs)
      .select()
      .order('created_at')

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath(`/recipes/${recipeId}`)
    return data || []
  }

  revalidatePath(`/recipes/${recipeId}`)
  return []
}

export async function updateSteps(
  recipeId: string,
  steps: Json
): Promise<void> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    throw new AuthorizationError()
  }

  // Check if step record exists
  const { data: existingStep, error: selectError } = await supabase
    .from('recipe_steps')
    .select('id')
    .eq('recipe_id', recipeId)
    .maybeSingle()

  if (selectError && selectError.code !== 'PGRST116') {
    throw new Error(selectError.message)
  }

  if (existingStep) {
    // Update existing record
    const { error } = await supabase
      .from('recipe_steps')
      .update({ content: steps })
      .eq('id', existingStep.id)

    if (error) {
      throw new Error(error.message)
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
      throw new Error(error.message)
    }
  }

  revalidatePath(`/recipes/${recipeId}`)
}

