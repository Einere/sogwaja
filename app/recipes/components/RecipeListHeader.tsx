'use client'

import Link from 'next/link'
import type { SortOption } from '../actions'

interface RecipeListHeaderProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function RecipeListHeader({
  sortBy,
  onSortChange,
}: RecipeListHeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-bold">조리법 목록</h1>
        <Link
          href="/recipes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="새 조리법 만들기"
        >
          + 새 조리법
        </Link>
      </div>
      <div className="flex gap-2" role="group" aria-label="정렬 옵션">
        <button
          onClick={() => onSortChange('name')}
          className={`px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            sortBy === 'name'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={sortBy === 'name'}
          aria-label="가나다순으로 정렬"
        >
          가나다순
        </button>
        <button
          onClick={() => onSortChange('updated')}
          className={`px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            sortBy === 'updated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={sortBy === 'updated'}
          aria-label="최근 수정순으로 정렬"
        >
          최근 수정순
        </button>
      </div>
    </header>
  )
}

