'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

export type SortOption = 'name' | 'updated'

interface ActionResult<T> {
  data?: T
  error?: string
}

export async function createRecipe(): Promise<ActionResult<Recipe>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Create recipe
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        title: '새 조리법',
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating recipe:', error)
      return { error: error.message }
    }

    revalidatePath('/recipes')
    return { data }
  } catch (error) {
    console.error('Unexpected error creating recipe:', error)
    return { error: '조리법 생성 중 오류가 발생했습니다.' }
  }
}

export async function getRecipe(id: string): Promise<ActionResult<Recipe>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: data || undefined }
  } catch (error) {
    console.error('Unexpected error getting recipe:', error)
    return { error: '조리법 조회 중 오류가 발생했습니다.' }
  }
}

export async function updateRecipeTitle(
  id: string,
  title: string
): Promise<ActionResult<Recipe>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    const { data, error } = await supabase
      .from('recipes')
      .update({ title })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the recipe
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/recipes/${id}`)
    revalidatePath('/recipes')
    return { data }
  } catch (error) {
    console.error('Unexpected error updating recipe title:', error)
    return { error: '조리법 제목 업데이트 중 오류가 발생했습니다.' }
  }
}

export async function deleteRecipe(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the recipe

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/recipes')
    return { data: undefined }
  } catch (error) {
    console.error('Unexpected error deleting recipe:', error)
    return { error: '조리법 삭제 중 오류가 발생했습니다.' }
  }
}

export async function getRecipes(
  sortBy: SortOption = 'updated'
): Promise<ActionResult<Recipe[]>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    let query = supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)

    if (sortBy === 'name') {
      query = query.order('title', { ascending: true })
    } else {
      query = query.order('updated_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error('Unexpected error getting recipes:', error)
    return { error: '조리법 목록 조회 중 오류가 발생했습니다.' }
  }
}

