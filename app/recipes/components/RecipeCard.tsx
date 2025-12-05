'use client'

import Link from 'next/link'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeCardProps {
  recipe: Recipe
  onDelete: (id: string) => Promise<void>
}

export default function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await onDelete(recipe.id)
      } catch {
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <article
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      aria-labelledby={`recipe-title-${recipe.id}`}
    >
      <Link href={`/recipes/${recipe.id}`} className="block">
        <h2
          id={`recipe-title-${recipe.id}`}
          className="text-lg font-semibold mb-1"
        >
          {recipe.title}
        </h2>
        <time
          className="text-sm text-gray-500"
          dateTime={recipe.updated_at}
        >
          {new Date(recipe.updated_at).toLocaleDateString('ko-KR')}
        </time>
      </Link>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/recipes/${recipe.id}/experiments`}
          className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label={`${recipe.title}의 실험 목록 보기`}
        >
          실험 목록
        </Link>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          aria-label={`${recipe.title} 삭제`}
        >
          삭제
        </button>
      </div>
    </article>
  )
}

