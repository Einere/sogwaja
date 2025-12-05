'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

interface ExperimentWithPhotos extends Experiment {
  photos: Photo[]
  thumbnail?: string
}

interface ActionResult<T> {
  data?: T
  error?: string
}

export async function getExperiments(
  recipeId: string
): Promise<ActionResult<ExperimentWithPhotos[]>> {
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

    // Load experiments
    const { data: experimentsData, error: experimentsError } = await supabase
      .from('recipe_experiments')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })

    if (experimentsError) {
      return { error: experimentsError.message }
    }

    // Load photos for each experiment
    const experimentsWithPhotos = await Promise.all(
      (experimentsData || []).map(async (experiment) => {
        const { data: photosData } = await supabase
          .from('experiment_photos')
          .select('*')
          .eq('experiment_id', experiment.id)
          .order('order', { ascending: true })

        const photos = photosData || []
        const thumbnail = photos[0]?.url

        return {
          ...experiment,
          photos,
          thumbnail,
        }
      })
    )

    return { data: experimentsWithPhotos }
  } catch (error) {
    console.error('Unexpected error getting experiments:', error)
    return { error: '실험 목록 조회 중 오류가 발생했습니다.' }
  }
}

export async function getExperiment(
  experimentId: string
): Promise<ActionResult<ExperimentWithPhotos>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Load experiment
    const { data: experimentData, error: experimentError } = await supabase
      .from('recipe_experiments')
      .select('*')
      .eq('id', experimentId)
      .single()

    if (experimentError) {
      return { error: experimentError.message }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', experimentData.recipe_id)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Load photos
    const { data: photosData } = await supabase
      .from('experiment_photos')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('order', { ascending: true })

    const photos = photosData || []
    const thumbnail = photos[0]?.url

    return {
      data: {
        ...experimentData,
        photos,
        thumbnail,
      },
    }
  } catch (error) {
    console.error('Unexpected error getting experiment:', error)
    return { error: '실험 조회 중 오류가 발생했습니다.' }
  }
}

export async function createExperiment(
  recipeId: string,
  memo: string | null,
  photos: File[]
): Promise<ActionResult<Experiment>> {
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

    // Create experiment
    const { data: experiment, error: experimentError } = await supabase
      .from('recipe_experiments')
      .insert({
        recipe_id: recipeId,
        memo: memo || null,
      })
      .select()
      .single()

    if (experimentError) {
      return { error: experimentError.message }
    }

    // Upload photos if any
    if (photos.length > 0 && experiment) {
      const photoUrls: string[] = []

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${i}.${fileExt}`
        const filePath = `${user.id}/${experiment.id}/${fileName}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const { error: uploadError } = await supabase.storage
          .from('experiment-photos')
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
          })

        if (uploadError) {
          console.error('Error uploading photo:', uploadError)
          continue // Skip failed uploads but continue with others
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('experiment-photos').getPublicUrl(filePath)

        photoUrls.push(publicUrl)
      }

      // Save photo records
      if (photoUrls.length > 0) {
        const photoRecords = photoUrls.map((url, index) => ({
          experiment_id: experiment.id,
          url,
          order: index,
        }))

        const { error: photosError } = await supabase
          .from('experiment_photos')
          .insert(photoRecords)

        if (photosError) {
          console.error('Error saving photo records:', photosError)
          // Don't fail the whole operation if photo records fail
        }
      }
    }

    revalidatePath(`/recipes/${recipeId}/experiments`)
    return { data: experiment }
  } catch (error) {
    console.error('Unexpected error creating experiment:', error)
    return { error: '실험 생성 중 오류가 발생했습니다.' }
  }
}

export async function deleteExperiment(
  experimentId: string
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: '인증되지 않은 사용자입니다.' }
    }

    // Load experiment to get recipe_id
    const { data: experiment, error: experimentError } = await supabase
      .from('recipe_experiments')
      .select('recipe_id')
      .eq('id', experimentId)
      .single()

    if (experimentError) {
      return { error: experimentError.message }
    }

    // Verify recipe ownership
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', experiment.recipe_id)
      .eq('user_id', user.id)
      .single()

    if (recipeError || !recipe) {
      return { error: '권한이 없습니다.' }
    }

    // Get photos to delete from storage
    const { data: photos } = await supabase
      .from('experiment_photos')
      .select('url')
      .eq('experiment_id', experimentId)

    // Delete photos from storage
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        const fileName = photo.url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('experiment-photos')
            .remove([`${user.id}/${experimentId}/${fileName}`])
        }
      }
    }

    // Delete experiment (cascade will delete photos)
    const { error } = await supabase
      .from('recipe_experiments')
      .delete()
      .eq('id', experimentId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/recipes/${experiment.recipe_id}/experiments`)
    return { data: undefined }
  } catch (error) {
    console.error('Unexpected error deleting experiment:', error)
    return { error: '실험 삭제 중 오류가 발생했습니다.' }
  }
}

