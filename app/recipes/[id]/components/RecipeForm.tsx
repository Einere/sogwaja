'use client'

import Link from 'next/link'
import EquipmentEditor from '../../components/RecipeFormFields/EquipmentEditor'
import IngredientEditor from '../../components/RecipeFormFields/IngredientEditor'
import OutputEditor from '../../components/RecipeFormFields/OutputEditor'
import StepEditor from '../../components/RecipeFormFields/StepEditor'
import type { Database } from '@/types/database'
import type { Json } from '@/types/database'
import type { Descendant } from 'slate'

type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']

interface RecipeFormProps {
  recipeId: string
  equipment: Equipment[]
  ingredients: Ingredient[]
  outputs: Output[]
  steps: Json | null
  onEquipmentChange: (equipment: Equipment[]) => void
  onIngredientsChange: (ingredients: Ingredient[]) => void
  onOutputsChange: (outputs: Output[]) => void
  onStepsChange: (steps: { children: Descendant[] }) => void
  onOutputQuantityChange: (quantity: number, unit: string) => void
  user: { id: string } | null
}

export default function RecipeForm({
  recipeId,
  equipment,
  ingredients,
  outputs,
  steps,
  onEquipmentChange,
  onIngredientsChange,
  onOutputsChange,
  onStepsChange,
  onOutputQuantityChange,
  user,
}: RecipeFormProps) {
  const initialSteps: { children: Descendant[] } = steps && typeof steps === 'object' && 'children' in steps
    ? (steps as unknown as { children: Descendant[] })
    : {
        children: [{ type: 'paragraph', children: [{ text: '' }] }] as unknown as Descendant[],
      }

  return (
    <main className="px-4 py-6 space-y-6">
      <EquipmentEditor
        equipment={equipment}
        onUpdate={onEquipmentChange}
        outputQuantity={outputs[0]?.quantity}
        outputUnit={outputs[0]?.unit}
      />

      <IngredientEditor
        ingredients={ingredients}
        onUpdate={onIngredientsChange}
        outputQuantity={outputs[0]?.quantity}
        outputUnit={outputs[0]?.unit}
      />

      <OutputEditor
        outputs={outputs}
        onUpdate={onOutputsChange}
        onQuantityChange={onOutputQuantityChange}
      />

      <section className="space-y-3" aria-labelledby="steps-heading">
        <h3 id="steps-heading" className="text-lg font-semibold">
          조리법 흐름
        </h3>
        <StepEditor
          value={initialSteps}
          onChange={onStepsChange}
          equipment={equipment}
          ingredients={ingredients}
        />
      </section>

      <div className="flex gap-3 pt-4">
        {user ? (
          <>
            <Link
              href={`/recipes/${recipeId}/experiments/new`}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg text-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="실험 저장"
            >
              실험 저장
            </Link>
            <Link
              href={`/recipes/${recipeId}/experiments`}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="실험 목록 보기"
            >
              실험 목록
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg text-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="로그인하여 실험 저장"
          >
            로그인하여 실험 저장
          </Link>
        )}
      </div>
    </main>
  )
}

