'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import type { Database } from '@/types/database'
import EquipmentEditor from '@/components/recipe/EquipmentEditor'
import IngredientEditor from '@/components/recipe/IngredientEditor'
import OutputEditor from '@/components/recipe/OutputEditor'
import StepEditor from '@/components/recipe/StepEditor'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']
type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

export default function ExperimentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const experimentId = params.experimentId as string
  const { user } = useAuth()
  const supabase = createClient()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  const [steps, setSteps] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, recipeId, experimentId])

  const loadData = async () => {
    try {
      // Load experiment
      const { data: experimentData, error: experimentError } = await supabase
        .from('recipe_experiments')
        .select('*')
        .eq('id', experimentId)
        .single()

      if (experimentError) throw experimentError
      setExperiment(experimentData)

      // Load photos
      const { data: photosData } = await supabase
        .from('experiment_photos')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('order', { ascending: true })

      setPhotos(photosData || [])

      // Load recipe data at the time of experiment
      // For now, we'll load current recipe data
      const { data: recipeData } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      setRecipe(recipeData)

      // Load equipment
      const { data: equipmentData } = await supabase
        .from('recipe_equipment')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      if (equipmentData) setEquipment(equipmentData)

      // Load ingredients
      const { data: ingredientsData } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      if (ingredientsData) setIngredients(ingredientsData)

      // Load outputs
      const { data: outputsData } = await supabase
        .from('recipe_outputs')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      if (outputsData) setOutputs(outputsData)

      // Load steps
      const { data: stepsData } = await supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .single()

      if (stepsData) {
        setSteps(stepsData.content)
      }
    } catch (error) {
      console.error('Error loading experiment:', error)
      router.push(`/recipes/${recipeId}/experiments`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      // Delete photos from storage
      if (photos.length > 0 && user) {
        for (const photo of photos) {
          const fileName = photo.url.split('/').pop()
          if (fileName) {
            await supabase.storage
              .from('experiment-photos')
              .remove([`${user.id}/${experimentId}/${fileName}`])
          }
        }
      }

      // Delete experiment
      const { error } = await supabase
        .from('recipe_experiments')
        .delete()
        .eq('id', experimentId)

      if (error) throw error
      router.push(`/recipes/${recipeId}/experiments`)
    } catch (error) {
      console.error('Error deleting experiment:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!experiment || !recipe) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/recipes/${recipeId}/experiments`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold">실험 결과</h1>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:underline text-sm"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
          <p className="text-sm text-gray-500">
            {new Date(experiment.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <EquipmentEditor
          equipment={equipment}
          onUpdate={() => {}} // Read-only
          outputQuantity={outputs[0]?.quantity}
          outputUnit={outputs[0]?.unit}
          readOnly={true}
        />

        <IngredientEditor
          ingredients={ingredients}
          onUpdate={() => {}} // Read-only
          outputQuantity={outputs[0]?.quantity}
          outputUnit={outputs[0]?.unit}
          readOnly={true}
        />

        <OutputEditor
          outputs={outputs}
          onUpdate={() => {}} // Read-only
          readOnly={true}
        />

        {steps && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">조리법 흐름</h3>
            <StepEditor
              value={steps}
              onChange={() => {}} // Read-only
              equipment={equipment}
              ingredients={ingredients}
              readOnly={true}
            />
          </div>
        )}

        {photos.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">사진</h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="Experiment photo"
                  className="w-full h-48 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}

        {experiment.memo && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">메모</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{experiment.memo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

