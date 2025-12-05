'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { getExperiment, deleteExperiment } from '@/app/recipes/[id]/experiments/actions'
import { getRecipeData } from '@/app/recipes/[id]/actions'
import EquipmentEditor from '@/app/recipes/components/RecipeFormFields/EquipmentEditor'
import IngredientEditor from '@/app/recipes/components/RecipeFormFields/IngredientEditor'
import OutputEditor from '@/app/recipes/components/RecipeFormFields/OutputEditor'
import StepEditor from '@/app/recipes/components/RecipeFormFields/StepEditor'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Link from 'next/link'

export default function ExperimentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const experimentId = params.experimentId as string
  const { user, loading: authLoading } = useAuth()
  const [experiment, setExperiment] = useState<any>(null)
  const [recipe, setRecipe] = useState<any>(null)
  const [equipment, setEquipment] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [outputs, setOutputs] = useState<any[]>([])
  const [steps, setSteps] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadData()
  }, [user, recipeId, experimentId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [experimentResult, recipeResult] = await Promise.all([
        getExperiment(experimentId),
        getRecipeData(recipeId),
      ])

      if (experimentResult.error) {
        setError(experimentResult.error)
        return
      }

      if (recipeResult.error) {
        setError(recipeResult.error)
        return
      }

      if (experimentResult.data) {
        setExperiment(experimentResult.data)
      }

      if (recipeResult.data) {
        setRecipe(recipeResult.data.recipe)
        setEquipment(recipeResult.data.equipment)
        setIngredients(recipeResult.data.ingredients)
        setOutputs(recipeResult.data.outputs)
        setSteps(recipeResult.data.steps)
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteExperiment(experimentId)
      if (result.error) {
        throw new Error(result.error)
      }
      router.push(`/recipes/${recipeId}/experiments`)
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner message="로딩 중..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => router.push(`/recipes/${recipeId}/experiments`)}
        retryLabel="목록으로"
      />
    )
  }

  if (!experiment || !recipe) {
    return null
  }

  const initialSteps = steps || {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  }

  return (
    <>
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/recipes/${recipeId}/experiments`}
              className="text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="실험 목록으로 돌아가기"
            >
              ← 목록으로
            </Link>
            <h1 className="text-xl font-bold">실험 결과</h1>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-red-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
              aria-label="실험 삭제"
            >
              삭제
            </button>
          </div>
        </header>

        <main className="px-4 py-6 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
            <time
              className="text-sm text-gray-500"
              dateTime={experiment.created_at}
            >
              {new Date(experiment.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </section>

          <EquipmentEditor
            equipment={equipment}
            onUpdate={() => {}}
            outputQuantity={outputs[0]?.quantity}
            outputUnit={outputs[0]?.unit}
            readOnly={true}
          />

          <IngredientEditor
            ingredients={ingredients}
            onUpdate={() => {}}
            outputQuantity={outputs[0]?.quantity}
            outputUnit={outputs[0]?.unit}
            readOnly={true}
          />

          <OutputEditor
            outputs={outputs}
            onUpdate={() => {}}
            readOnly={true}
          />

          {steps && (
            <section className="space-y-3" aria-labelledby="steps-heading">
              <h3 id="steps-heading" className="text-lg font-semibold">
                조리법 흐름
              </h3>
              <StepEditor
                value={initialSteps}
                onChange={() => {}}
                equipment={equipment}
                ingredients={ingredients}
                readOnly={true}
              />
            </section>
          )}

          {experiment.photos && experiment.photos.length > 0 && (
            <section className="space-y-3" aria-labelledby="photos-heading">
              <h3 id="photos-heading" className="text-lg font-semibold">
                사진
              </h3>
              <div className="grid grid-cols-2 gap-2" role="list" aria-label="실험 사진">
                {experiment.photos.map((photo: any) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="실험 사진"
                    className="w-full h-48 object-cover rounded"
                  />
                ))}
              </div>
            </section>
          )}

          {experiment.memo && (
            <section className="space-y-3" aria-labelledby="memo-heading">
              <h3 id="memo-heading" className="text-lg font-semibold">
                메모
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{experiment.memo}</p>
              </div>
            </section>
          )}
        </main>
      </div>
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="실험 삭제"
        message="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </>
  )
}
