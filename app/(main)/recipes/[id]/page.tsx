'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDebounce } from '@/lib/hooks/useDebounce'
import EquipmentEditor from '@/components/recipe/EquipmentEditor'
import IngredientEditor from '@/components/recipe/IngredientEditor'
import OutputEditor from '@/components/recipe/OutputEditor'
import StepEditor from '@/components/recipe/StepEditor'
import { calculateIngredients, calculateEquipment } from '@/lib/utils/calculations'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Equipment = Database['public']['Tables']['recipe_equipment']['Row']
type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Output = Database['public']['Tables']['recipe_outputs']['Row']

export default function RecipeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [title, setTitle] = useState('')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  const [steps, setSteps] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // 저장 중인지 추적하여 불필요한 상태 업데이트 방지
  const savingRef = { current: false }
  
  // 초기 로드된 데이터를 저장하여 변경사항 비교에 사용
  const initialDataRef = useRef<{
    equipment: Equipment[]
    ingredients: Ingredient[]
    outputs: Output[]
    steps: any
    loaded: boolean
    isInitializing: boolean
  }>({
    equipment: [],
    ingredients: [],
    outputs: [],
    steps: null,
    loaded: false,
    isInitializing: true,
  })

  const debouncedTitle = useDebounce(title, 1000)
  const debouncedEquipment = useDebounce(equipment, 1000)
  const debouncedIngredients = useDebounce(ingredients, 1000)
  const debouncedOutputs = useDebounce(outputs, 1000)
  const debouncedSteps = useDebounce(steps, 1000)

  useEffect(() => {
    if (!user || !recipeId) return
    loadRecipe()
  }, [user, recipeId])

  // 초기 로드된 데이터와 비교하여 실제 변경사항이 있는지 확인
  const hasEquipmentChanges = useCallback(() => {
    if (!initialDataRef.current.loaded) return false
    return JSON.stringify(debouncedEquipment) !== JSON.stringify(initialDataRef.current.equipment)
  }, [debouncedEquipment])

  const hasIngredientsChanges = useCallback(() => {
    if (!initialDataRef.current.loaded) return false
    return JSON.stringify(debouncedIngredients) !== JSON.stringify(initialDataRef.current.ingredients)
  }, [debouncedIngredients])

  const hasOutputsChanges = useCallback(() => {
    if (!initialDataRef.current.loaded) return false
    return JSON.stringify(debouncedOutputs) !== JSON.stringify(initialDataRef.current.outputs)
  }, [debouncedOutputs])

  const hasStepsChanges = useCallback(() => {
    if (!initialDataRef.current.loaded || !debouncedSteps) return false
    return JSON.stringify(debouncedSteps) !== JSON.stringify(initialDataRef.current.steps)
  }, [debouncedSteps])

  useEffect(() => {
    if (!recipe || !user) return
    // 변경사항이 없으면 저장하지 않음
    if (debouncedTitle === recipe.title) return
    saveTitle()
  }, [debouncedTitle])

  useEffect(() => {
    if (!recipe || !user || !initialDataRef.current.loaded) return
    // 초기화 중이면 저장하지 않음
    if (initialDataRef.current.isInitializing) return
    // 초기 로드된 데이터와 비교하여 변경사항이 있을 때만 저장
    if (hasEquipmentChanges()) {
      saveEquipment()
    }
  }, [debouncedEquipment, hasEquipmentChanges])

  useEffect(() => {
    if (!recipe || !user || !initialDataRef.current.loaded) return
    // 초기화 중이면 저장하지 않음
    if (initialDataRef.current.isInitializing) return
    // 초기 로드된 데이터와 비교하여 변경사항이 있을 때만 저장
    if (hasIngredientsChanges()) {
      saveIngredients()
    }
  }, [debouncedIngredients, hasIngredientsChanges])

  useEffect(() => {
    if (!recipe || !user || !initialDataRef.current.loaded) return
    // 초기화 중이면 저장하지 않음
    if (initialDataRef.current.isInitializing) return
    // 초기 로드된 데이터와 비교하여 변경사항이 있을 때만 저장
    if (hasOutputsChanges()) {
      saveOutputs()
    }
  }, [debouncedOutputs, hasOutputsChanges])

  useEffect(() => {
    if (!recipe || !user || !debouncedSteps || !initialDataRef.current.loaded) return
    // 초기화 중이면 저장하지 않음
    if (initialDataRef.current.isInitializing) return
    // 초기 로드된 데이터와 비교하여 변경사항이 있을 때만 저장
    if (hasStepsChanges()) {
      saveSteps()
    }
  }, [debouncedSteps, hasStepsChanges])

  const loadRecipe = async () => {
    try {
      // Load recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single()

      if (recipeError) throw recipeError
      if (!recipeData) {
        router.push('/recipes')
        return
      }

      setRecipe(recipeData)
      setTitle(recipeData.title)

      // Load equipment
      const { data: equipmentData } = await supabase
        .from('recipe_equipment')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      const equipmentDataToSet = equipmentData || []
      setEquipment(equipmentDataToSet)

      // Load ingredients
      const { data: ingredientsData } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      const ingredientsDataToSet = ingredientsData || []
      setIngredients(ingredientsDataToSet)

      // Load outputs
      const { data: outputsData } = await supabase
        .from('recipe_outputs')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at')

      const outputsDataToSet = outputsData || []
      setOutputs(outputsDataToSet)

      // Load steps
      const { data: stepsData } = await supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .maybeSingle()

      let stepsDataToSet: any
      if (stepsData && stepsData.content) {
        stepsDataToSet = stepsData.content
      } else {
        // Initialize empty Slate editor content
        stepsDataToSet = {
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        }
      }
      setSteps(stepsDataToSet)

      // 초기 로드된 데이터를 ref에 저장 (변경사항 비교용)
      // 깊은 복사하여 참조가 아닌 값으로 저장
      initialDataRef.current = {
        equipment: JSON.parse(JSON.stringify(equipmentDataToSet)),
        ingredients: JSON.parse(JSON.stringify(ingredientsDataToSet)),
        outputs: JSON.parse(JSON.stringify(outputsDataToSet)),
        steps: JSON.parse(JSON.stringify(stepsDataToSet)),
        loaded: true,
        isInitializing: true,
      }
      
      // 상태가 안정화된 후 초기화 완료
      // 이렇게 하면 초기 로드 후 리렌더링으로 인한 저장을 방지할 수 있음
      setTimeout(() => {
        initialDataRef.current.isInitializing = false
      }, 100)
    } catch (error) {
      console.error('Error loading recipe:', error)
      router.push('/recipes')
    } finally {
      setLoading(false)
    }
  }

  const saveTitle = async () => {
    if (!recipe || !debouncedTitle) return
    if (debouncedTitle === recipe.title) return // 변경사항이 없으면 저장하지 않음
    
    savingRef.current = true
    setSaving(true)
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ title: debouncedTitle })
        .eq('id', recipe.id)
      if (error) throw error
      // 저장 성공 시 recipe 상태만 업데이트 (title 상태는 그대로 유지)
      setRecipe((prev) => prev ? { ...prev, title: debouncedTitle } : null)
    } catch (error) {
      console.error('Error saving title:', error)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const saveEquipment = async () => {
    if (!recipe) return
    if (savingRef.current) return // 이미 저장 중이면 건너뛰기
    
    savingRef.current = true
    setSaving(true)
    try {
      // Delete all existing equipment
      await supabase.from('recipe_equipment').delete().eq('recipe_id', recipe.id)

      // Insert new equipment (filter out temp IDs)
      const equipmentToSave = debouncedEquipment
        .filter((eq) => !eq.id.startsWith('temp-'))
        .map(({ id, created_at, ...eq }) => ({
          ...eq,
          recipe_id: recipe.id,
        }))

      // Insert new equipment
      const newEquipment = debouncedEquipment.filter((eq) => eq.id.startsWith('temp-'))
      if (newEquipment.length > 0 || equipmentToSave.length > 0) {
        const allEquipment = [
          ...equipmentToSave,
          ...newEquipment.map(({ id, created_at, ...eq }) => ({
            ...eq,
            recipe_id: recipe.id,
          })),
        ]

        const { error } = await supabase.from('recipe_equipment').insert(allEquipment)
        if (error) throw error

        // 저장 후 실제 ID를 가진 데이터만 업데이트 (temp ID가 있는 경우에만)
        const hasTempIds = debouncedEquipment.some((eq) => eq.id.startsWith('temp-'))
        if (hasTempIds) {
          const { data } = await supabase
            .from('recipe_equipment')
            .select('*')
            .eq('recipe_id', recipe.id)
            .order('created_at')
          if (data) {
            // 현재 포커스된 요소가 있는지 확인
            const activeElement = document.activeElement
            const isInputFocused = activeElement && (
              activeElement.tagName === 'INPUT' || 
              activeElement.tagName === 'TEXTAREA'
            )
            
            // 입력 필드에 포커스가 없을 때만 상태 업데이트
            if (!isInputFocused) {
              setEquipment(data)
              // 저장 후 초기 데이터 참조 업데이트
              initialDataRef.current.equipment = data
            } else {
              // 포커스가 있을 때는 나중에 업데이트 (약간의 지연)
              setTimeout(() => {
                setEquipment(data)
                initialDataRef.current.equipment = data
              }, 500)
            }
          }
        } else {
          // temp ID가 없어도 저장 후 초기 데이터 참조 업데이트
          initialDataRef.current.equipment = debouncedEquipment
        }
      } else {
        // 빈 배열로 저장된 경우
        initialDataRef.current.equipment = []
      }
    } catch (error) {
      console.error('Error saving equipment:', error)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const saveIngredients = async () => {
    if (!recipe) return
    if (savingRef.current) return // 이미 저장 중이면 건너뛰기
    
    savingRef.current = true
    setSaving(true)
    try {
      // Delete all existing ingredients
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id)

      // Insert new ingredients
      const ingredientsToSave = debouncedIngredients
        .filter((ing) => !ing.id.startsWith('temp-'))
        .map(({ id, created_at, ...ing }) => ({
          ...ing,
          recipe_id: recipe.id,
        }))

      const newIngredients = debouncedIngredients.filter((ing) => ing.id.startsWith('temp-'))
      if (newIngredients.length > 0 || ingredientsToSave.length > 0) {
        const allIngredients = [
          ...ingredientsToSave,
          ...newIngredients.map(({ id, created_at, ...ing }) => ({
            ...ing,
            recipe_id: recipe.id,
          })),
        ]

        const { error } = await supabase.from('recipe_ingredients').insert(allIngredients)
        if (error) throw error

        // 저장 후 실제 ID를 가진 데이터만 업데이트 (temp ID가 있는 경우에만)
        const hasTempIds = debouncedIngredients.some((ing) => ing.id.startsWith('temp-'))
        if (hasTempIds) {
          const { data } = await supabase
            .from('recipe_ingredients')
            .select('*')
            .eq('recipe_id', recipe.id)
            .order('created_at')
          if (data) {
            // 현재 포커스된 요소가 있는지 확인
            const activeElement = document.activeElement
            const isInputFocused = activeElement && (
              activeElement.tagName === 'INPUT' || 
              activeElement.tagName === 'TEXTAREA'
            )
            
            // 입력 필드에 포커스가 없을 때만 상태 업데이트
            if (!isInputFocused) {
              setIngredients(data)
              initialDataRef.current.ingredients = data
            } else {
              // 포커스가 있을 때는 나중에 업데이트 (약간의 지연)
              setTimeout(() => {
                setIngredients(data)
                initialDataRef.current.ingredients = data
              }, 500)
            }
          }
        } else {
          // temp ID가 없어도 저장 후 초기 데이터 참조 업데이트
          initialDataRef.current.ingredients = debouncedIngredients
        }
      } else {
        // 빈 배열로 저장된 경우
        initialDataRef.current.ingredients = []
      }
    } catch (error) {
      console.error('Error saving ingredients:', error)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const saveOutputs = async () => {
    if (!recipe) return
    if (savingRef.current) return // 이미 저장 중이면 건너뛰기
    
    savingRef.current = true
    setSaving(true)
    try {
      // Delete all existing outputs
      await supabase.from('recipe_outputs').delete().eq('recipe_id', recipe.id)

      // Insert new outputs
      const outputsToSave = debouncedOutputs
        .filter((out) => !out.id.startsWith('temp-'))
        .map(({ id, created_at, ...out }) => ({
          ...out,
          recipe_id: recipe.id,
        }))

      const newOutputs = debouncedOutputs.filter((out) => out.id.startsWith('temp-'))
      if (newOutputs.length > 0 || outputsToSave.length > 0) {
        const allOutputs = [
          ...outputsToSave,
          ...newOutputs.map(({ id, created_at, ...out }) => ({
            ...out,
            recipe_id: recipe.id,
          })),
        ]

        const { error } = await supabase.from('recipe_outputs').insert(allOutputs)
        if (error) throw error

        // 저장 후 실제 ID를 가진 데이터만 업데이트 (temp ID가 있는 경우에만)
        const hasTempIds = debouncedOutputs.some((out) => out.id.startsWith('temp-'))
        if (hasTempIds) {
          const { data } = await supabase
            .from('recipe_outputs')
            .select('*')
            .eq('recipe_id', recipe.id)
            .order('created_at')
          if (data) {
            // 현재 포커스된 요소가 있는지 확인
            const activeElement = document.activeElement
            const isInputFocused = activeElement && (
              activeElement.tagName === 'INPUT' || 
              activeElement.tagName === 'TEXTAREA'
            )
            
            // 입력 필드에 포커스가 없을 때만 상태 업데이트
            if (!isInputFocused) {
              setOutputs(data)
              initialDataRef.current.outputs = data
            } else {
              // 포커스가 있을 때는 나중에 업데이트 (약간의 지연)
              setTimeout(() => {
                setOutputs(data)
                initialDataRef.current.outputs = data
              }, 500)
            }
          }
        } else {
          // temp ID가 없어도 저장 후 초기 데이터 참조 업데이트
          initialDataRef.current.outputs = debouncedOutputs
        }
      } else {
        // 빈 배열로 저장된 경우
        initialDataRef.current.outputs = []
      }
    } catch (error) {
      console.error('Error saving outputs:', error)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const saveSteps = async () => {
    if (!recipe || !debouncedSteps) return
    if (savingRef.current) return // 이미 저장 중이면 건너뛰기
    
    savingRef.current = true
    setSaving(true)
    try {
      // 기존 레코드 확인 (maybeSingle을 사용하여 레코드가 없어도 에러가 발생하지 않도록)
      const { data: existingStep, error: selectError } = await supabase
        .from('recipe_steps')
        .select('id')
        .eq('recipe_id', recipe.id)
        .maybeSingle()

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116은 "no rows returned" 에러이므로 무시
        throw selectError
      }

      if (existingStep) {
        // 기존 레코드가 있으면 업데이트
        const { error } = await supabase
          .from('recipe_steps')
          .update({
            content: debouncedSteps,
          })
          .eq('id', existingStep.id)
        if (error) throw error
      } else {
        // 기존 레코드가 없으면 삽입
        const { error } = await supabase
          .from('recipe_steps')
          .insert({
            recipe_id: recipe.id,
            content: debouncedSteps,
          })
        if (error) throw error
      }
      // 저장 후 초기 데이터 참조 업데이트
      initialDataRef.current.steps = debouncedSteps
    } catch (error) {
      console.error('Error saving steps:', error)
    } finally {
      setSaving(false)
      savingRef.current = false
    }
  }

  const handleOutputQuantityChange = (quantity: number, unit: string) => {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!recipe) {
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/recipes"
            className="text-blue-600 hover:underline text-sm"
          >
            ← 목록으로
          </Link>
          {saving && <span className="text-sm text-gray-500">저장 중...</span>}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-none focus:outline-none"
          placeholder="조리법 제목"
        />
      </div>

      <div className="px-4 py-6 space-y-6">
        <EquipmentEditor
          equipment={equipment}
          onUpdate={setEquipment}
          outputQuantity={outputs[0]?.quantity}
          outputUnit={outputs[0]?.unit}
        />

        <IngredientEditor
          ingredients={ingredients}
          onUpdate={setIngredients}
          outputQuantity={outputs[0]?.quantity}
          outputUnit={outputs[0]?.unit}
        />

        <OutputEditor
          outputs={outputs}
          onUpdate={setOutputs}
          onQuantityChange={handleOutputQuantityChange}
        />

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">조리법 흐름</h3>
          <StepEditor
            value={steps}
            onChange={setSteps}
            equipment={equipment}
            ingredients={ingredients}
          />
        </div>

        <div className="flex gap-3 pt-4">
          {user ? (
            <>
              <Link
                href={`/recipes/${recipeId}/experiments/new`}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg text-center hover:bg-green-700"
              >
                실험 저장
              </Link>
              <Link
                href={`/recipes/${recipeId}/experiments`}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-center hover:bg-gray-300"
              >
                실험 목록
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg text-center hover:bg-green-700"
            >
              로그인하여 실험 저장
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

