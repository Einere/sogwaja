'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'
import EditorItem from './EditorItem'
import EditorForm from './EditorForm'

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

  const handleUpdate = (
    id: string,
    field: 'name' | 'quantity' | 'unit',
    value: string | number
  ) => {
    onUpdate(
      equipment.map((eq) =>
        eq.id === id ? { ...eq, [field]: value } : eq
      )
    )
  }

  return (
    <section className="space-y-3" aria-labelledby="equipment-heading">
      <h3 id="equipment-heading" className="text-lg font-semibold">
        장비
      </h3>
      <div className="space-y-2" role="list" aria-label="장비 목록">
        {equipment.map((eq) => (
          <EditorItem
            key={eq.id}
            id={eq.id}
            name={eq.name}
            value={eq.quantity}
            unit={eq.unit}
            onNameChange={(value) => handleUpdate(eq.id, 'name', value)}
            onValueChange={(value) => handleUpdate(eq.id, 'quantity', value)}
            onUnitChange={(value) => handleUpdate(eq.id, 'unit', value)}
            onRemove={!readOnly ? () => handleRemove(eq.id) : undefined}
            readOnly={readOnly}
            namePlaceholder="장비 이름"
            valuePlaceholder="개수"
            unitPlaceholder="단위"
            ariaLabel={`장비: ${eq.name}, ${eq.quantity} ${eq.unit}`}
          />
        ))}
      </div>
      {!readOnly && (
        <EditorForm
          name={newName}
          value={newQuantity}
          unit={newUnit}
          onNameChange={setNewName}
          onValueChange={setNewQuantity}
          onUnitChange={setNewUnit}
          onSubmit={handleAdd}
          namePlaceholder="장비 이름"
          valuePlaceholder="개수"
          unitPlaceholder="단위"
          submitLabel="추가"
          ariaLabel="새 장비 추가"
        />
      )}
    </section>
  )
}

