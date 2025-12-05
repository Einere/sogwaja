'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'

type Equipment = Database['public']['Tables']['recipe_equipment']['Row']

interface EquipmentEditorProps {
  equipment: Equipment[]
  onUpdate: (equipment: Equipment[]) => void
  outputQuantity?: number
  outputUnit?: string
  readOnly?: boolean
}

export default function EquipmentEditor({
  equipment,
  onUpdate,
  outputQuantity = 1,
  outputUnit = '개',
  readOnly = false,
}: EquipmentEditorProps) {
  const [newName, setNewName] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [newUnit, setNewUnit] = useState('개')

  const handleAdd = () => {
    if (!newName.trim() || !newQuantity) return

    const newEquipment: Equipment = {
      id: `temp-${Date.now()}`,
      recipe_id: '',
      name: newName.trim(),
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      created_at: new Date().toISOString(),
    }

    onUpdate([...equipment, newEquipment])
    setNewName('')
    setNewQuantity('')
    setNewUnit('개')
  }

  const handleRemove = (id: string) => {
    onUpdate(equipment.filter((eq) => eq.id !== id))
  }

  const handleUpdate = (id: string, field: 'name' | 'quantity' | 'unit', value: string | number) => {
    onUpdate(
      equipment.map((eq) =>
        eq.id === id ? { ...eq, [field]: value } : eq
      )
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">장비</h3>
      <div className="space-y-2">
        {equipment.map((eq) => (
          <div
            key={eq.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
          >
            <input
              type="text"
              value={eq.name}
              onChange={(e) => handleUpdate(eq.id, 'name', e.target.value)}
              disabled={readOnly}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="장비 이름"
            />
            <input
              type="number"
              value={eq.quantity}
              onChange={(e) => handleUpdate(eq.id, 'quantity', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="개수"
            />
            <input
              type="text"
              value={eq.unit}
              onChange={(e) => handleUpdate(eq.id, 'unit', e.target.value)}
              disabled={readOnly}
              className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100"
              placeholder="단위"
            />
            {!readOnly && (
              <button
                onClick={() => handleRemove(eq.id)}
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
          placeholder="장비 이름"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="개수"
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

