'use server'

import { createClient } from '@/lib/supabase/server'
import { requireServerUser } from '@/lib/supabase/auth'
import { AuthorizationError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'
import type { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

export interface ExperimentWithPhotos extends Experiment {
  photos: Photo[]
  thumbnail?: string
}

export async function getExperiments(
  recipeId: string
): Promise<ExperimentWithPhotos[]> {
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

  // Load experiments
  const { data: experimentsData, error: experimentsError } = await supabase
    .from('recipe_experiments')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })

  if (experimentsError) {
    throw new Error(experimentsError.message)
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

  return experimentsWithPhotos
}

export async function getExperiment(
  experimentId: string
): Promise<ExperimentWithPhotos> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Load experiment
  const { data: experimentData, error: experimentError } = await supabase
    .from('recipe_experiments')
    .select('*')
    .eq('id', experimentId)
    .single()

  if (experimentError) {
    notFound()
  }

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', experimentData.recipe_id)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    notFound()
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
    ...experimentData,
    photos,
    thumbnail,
  }
}

export async function createExperiment(
  recipeId: string,
  memo: string | null,
  photos: File[]
): Promise<Experiment> {
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
    throw new Error(experimentError.message)
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
  return experiment
}

export async function deleteExperiment(
  experimentId: string
): Promise<void> {
  const user = await requireServerUser()
  const supabase = await createClient()

  // Load experiment to get recipe_id
  const { data: experiment, error: experimentError } = await supabase
    .from('recipe_experiments')
    .select('recipe_id')
    .eq('id', experimentId)
    .single()

  if (experimentError) {
    throw new Error(experimentError.message)
  }

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', experiment.recipe_id)
    .eq('user_id', user.id)
    .single()

  if (recipeError || !recipe) {
    throw new AuthorizationError()
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
    throw new Error(error.message)
  }

  revalidatePath(`/recipes/${experiment.recipe_id}/experiments`)
}

