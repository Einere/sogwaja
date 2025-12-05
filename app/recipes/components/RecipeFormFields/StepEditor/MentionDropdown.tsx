'use client'

import type { MentionItem, DropdownPosition } from './types'

interface MentionDropdownProps {
  items: MentionItem[]
  selectedIndex: number
  position: DropdownPosition
  onSelect: (item: MentionItem) => void
}

export default function MentionDropdown({
  items,
  selectedIndex,
  position,
  onSelect,
}: MentionDropdownProps) {
  return (
    <div
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '200px',
      }}
      role="listbox"
      aria-label="멘션 목록"
      aria-expanded="true"
    >
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`px-3 py-2 cursor-pointer ${
            i === selectedIndex
              ? item.type === 'equipment'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={i === selectedIndex}
          aria-label={`${item.type === 'equipment' ? '장비' : '재료'}: ${item.displayName}`}
        >
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${
              item.type === 'equipment'
                ? 'bg-blue-200 text-blue-800'
                : 'bg-green-200 text-green-800'
            }`}
          >
            {item.type === 'equipment' ? '장비' : '재료'}
          </span>
          {item.displayName.replace(/\s+/g, '_')}
        </div>
      ))}
    </div>
  )
}

