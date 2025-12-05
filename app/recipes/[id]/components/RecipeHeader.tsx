'use client'

import Link from 'next/link'

interface RecipeHeaderProps {
  recipeId: string
  title: string
  onTitleChange: (title: string) => void
  saving?: boolean
}

export default function RecipeHeader({
  recipeId,
  title,
  onTitleChange,
  saving = false,
}: RecipeHeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/recipes"
          className="text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="조리법 목록으로 돌아가기"
        >
          ← 목록으로
        </Link>
        {saving && (
          <span
            className="text-sm text-gray-500"
            role="status"
            aria-live="polite"
            aria-label="저장 중"
          >
            저장 중...
          </span>
        )}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="w-full text-2xl font-bold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        placeholder="조리법 제목"
        aria-label="조리법 제목"
      />
    </header>
  )
}

