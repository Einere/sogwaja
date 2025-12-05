'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'

type Output = Database['public']['Tables']['recipe_outputs']['Row']

interface OutputEditorProps {
  outputs: Output[]
  onUpdate: (outputs: Output[]) => void
  onQuantityChange?: (quantity: number, unit: string) => void
  readOnly?: boolean
}

export default function OutputEditor({
  outputs,
  onUpdate,
  onQuantityChange,
  readOnly = false,
}: OutputEditorProps) {
  const [newName, setNewName] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [newUnit, setNewUnit] = useState('개')

  const handleAdd = () => {
    if (!newName.trim() || !newQuantity) return

    const newOutput: Output = {
      id: `temp-${Date.now()}`,
      recipe_id: '',
      name: newName.trim(),
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      created_at: new Date().toISOString(),
    }

    onUpdate([...outputs, newOutput])
    setNewName('')
    setNewQuantity('')
    setNewUnit('개')
  }

  const handleRemove = (id: string) => {
    onUpdate(outputs.filter((out) => out.id !== id))
  }

  const handleUpdate = (id: string, field: 'name' | 'quantity' | 'unit', value: string | number) => {
    const updated = outputs.map((out) =>
      out.id === id ? { ...out, [field]: value } : out
    )
    onUpdate(updated)

    if (field === 'quantity' || field === 'unit') {
      const output = updated.find((out) => out.id === id)
      if (output && onQuantityChange) {
        onQuantityChange(output.quantity, output.unit)
      }
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">결과물</h3>
      <div className="space-y-2">
        {outputs.map((out) => (
          <div
            key={out.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <input
              type="text"
              value={out.name}
              onChange={(e) => handleUpdate(out.id, 'name', e.target.value)}
              disabled={readOnly}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="결과물 이름"
            />
            <input
              type="number"
              value={out.quantity}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                handleUpdate(out.id, 'quantity', value)
              }}
              disabled={readOnly}
              className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="양"
            />
            <select
              value={out.unit}
              onChange={(e) => handleUpdate(out.id, 'unit', e.target.value)}
              disabled={readOnly}
              className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
            >
              <option value="개">개</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
            </select>
            {!readOnly && (
              <button
                onClick={() => handleRemove(out.id)}
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
          placeholder="결과물 이름"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="양"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <select
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value="개">개</option>
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="L">L</option>
        </select>
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

