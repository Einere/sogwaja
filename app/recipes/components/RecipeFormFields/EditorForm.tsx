'use client'

interface EditorFormProps {
  name: string
  value: string
  unit: string
  onNameChange: (value: string) => void
  onValueChange: (value: string) => void
  onUnitChange: (value: string) => void
  onSubmit: () => void
  namePlaceholder?: string
  valuePlaceholder?: string
  unitPlaceholder?: string
  unitType?: 'input' | 'select'
  unitOptions?: { value: string; label: string }[]
  submitLabel?: string
  ariaLabel?: string
}

export default function EditorForm({
  name,
  value,
  unit,
  onNameChange,
  onValueChange,
  onUnitChange,
  onSubmit,
  namePlaceholder = '이름',
  valuePlaceholder = '값',
  unitPlaceholder = '단위',
  unitType = 'input',
  unitOptions,
  submitLabel = '추가',
  ariaLabel,
}: EditorFormProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit()
    }
  }

  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label={ariaLabel || '새 항목 추가'}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={namePlaceholder}
        aria-label={`${namePlaceholder} 입력`}
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={valuePlaceholder}
        aria-label={`${valuePlaceholder} 입력`}
      />
      {unitType === 'select' && unitOptions ? (
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-16 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={unitPlaceholder}
          aria-label={`${unitPlaceholder} 입력`}
        />
      )}
      <button
        onClick={onSubmit}
        className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={submitLabel}
      >
        {submitLabel}
      </button>
    </div>
  )
}

