'use client'

interface EditorItemProps {
  id: string
  name: string
  value: string | number
  unit: string
  onNameChange: (value: string) => void
  onValueChange: (value: number) => void
  onUnitChange: (value: string) => void
  onRemove?: () => void
  readOnly?: boolean
  namePlaceholder?: string
  valuePlaceholder?: string
  unitPlaceholder?: string
  unitType?: 'input' | 'select'
  unitOptions?: { value: string; label: string }[]
  ariaLabel?: string
}

export default function EditorItem({
  id,
  name,
  value,
  unit,
  onNameChange,
  onValueChange,
  onUnitChange,
  onRemove,
  readOnly = false,
  namePlaceholder = '이름',
  valuePlaceholder = '값',
  unitPlaceholder = '단위',
  unitType = 'input',
  unitOptions,
  ariaLabel,
}: EditorItemProps) {
  const itemId = `editor-item-${id}`

  return (
    <div
      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
      role="listitem"
      aria-label={ariaLabel || `${name}, ${value} ${unit}`}
    >
      <input
        type="text"
        id={`${itemId}-name`}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        disabled={readOnly}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={namePlaceholder}
        aria-label={`${namePlaceholder} 입력`}
      />
      <input
        type="number"
        id={`${itemId}-value`}
        value={value}
        onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
        disabled={readOnly}
        className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={valuePlaceholder}
        aria-label={`${valuePlaceholder} 입력`}
      />
      {unitType === 'select' && unitOptions ? (
        <select
          id={`${itemId}-unit`}
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          disabled={readOnly}
          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="단위 선택"
        >
          {unitOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          id={`${itemId}-unit`}
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          disabled={readOnly}
          className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={unitPlaceholder}
          aria-label={`${unitPlaceholder} 입력`}
        />
      )}
      {!readOnly && onRemove && (
        <button
          onClick={onRemove}
          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="삭제"
        >
          삭제
        </button>
      )}
    </div>
  )
}

