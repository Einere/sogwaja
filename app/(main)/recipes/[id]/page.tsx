'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRecipeEditor } from '@/app/recipes/[id]/hooks/useRecipeEditor'
import RecipeHeader from '@/app/recipes/[id]/components/RecipeHeader'
import RecipeForm from '@/app/recipes/[id]/components/RecipeForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'

export default function RecipeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const {
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
    setEquipment,
    setIngredients,
    setOutputs,
    setSteps,
    handleOutputQuantityChange,
  } = useRecipeEditor(recipeId)

  if (authLoading || loading) {
    return <LoadingSpinner message="로딩 중..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => router.push('/recipes')}
        retryLabel="목록으로 돌아가기"
      />
    )
  }

  if (!recipe) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <RecipeHeader
        recipeId={recipeId}
        title={title}
        onTitleChange={setTitle}
        saving={saving}
      />
      <RecipeForm
        recipeId={recipeId}
        equipment={equipment}
        ingredients={ingredients}
        outputs={outputs}
        steps={steps}
        onEquipmentChange={setEquipment}
        onIngredientsChange={setIngredients}
        onOutputsChange={setOutputs}
        onStepsChange={setSteps}
        onOutputQuantityChange={handleOutputQuantityChange}
        user={user}
      />
    </div>
  )
}
