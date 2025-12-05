'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'

type Ingredient = Database['public']['Tables']['recipe_ingredients']['Row']

interface IngredientEditorProps {
  ingredients: Ingredient[]
  onUpdate: (ingredients: Ingredient[]) => void
  outputQuantity?: number
  outputUnit?: string
  readOnly?: boolean
}

export default function IngredientEditor({
  ingredients,
  onUpdate,
  outputQuantity = 1,
  outputUnit = '개',
  readOnly = false,
}: IngredientEditorProps) {
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newUnit, setNewUnit] = useState('g')

  const handleAdd = () => {
    if (!newName.trim() || !newAmount) return

    const newIngredient: Ingredient = {
      id: `temp-${Date.now()}`,
      recipe_id: '',
      name: newName.trim(),
      amount: parseFloat(newAmount),
      unit: newUnit,
      created_at: new Date().toISOString(),
    }

    onUpdate([...ingredients, newIngredient])
    setNewName('')
    setNewAmount('')
    setNewUnit('g')
  }

  const handleRemove = (id: string) => {
    onUpdate(ingredients.filter((ing) => ing.id !== id))
  }

  const handleUpdate = (id: string, field: 'name' | 'amount' | 'unit', value: string | number) => {
    onUpdate(
      ingredients.map((ing) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">재료</h3>
      <div className="space-y-2">
        {ingredients.map((ing) => (
          <div
            key={ing.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <input
              type="text"
              value={ing.name}
              onChange={(e) => handleUpdate(ing.id, 'name', e.target.value)}
              disabled={readOnly}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="재료 이름"
            />
            <input
              type="number"
              value={ing.amount}
              onChange={(e) => handleUpdate(ing.id, 'amount', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="양"
            />
            <input
              type="text"
              value={ing.unit}
              onChange={(e) => handleUpdate(ing.id, 'unit', e.target.value)}
              disabled={readOnly}
              className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="단위"
            />
            {!readOnly && (
              <button
                onClick={() => handleRemove(ing.id)}
                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="재료 이름"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="number"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="양"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="단위"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          추가
        </button>
        </div>
      )}
    </div>
  )
}

