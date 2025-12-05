'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']

type SortOption = 'name' | 'updated'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('updated')
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    loadRecipes()
  }, [user, sortBy])

  const loadRecipes = async () => {
    if (!user) return

    try {
      let query = supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)

      if (sortBy === 'name') {
        query = query.order('title', { ascending: true })
      } else {
        query = query.order('updated_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      setRecipes(data || [])
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
      loadRecipes()
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-600 mb-4 text-center">
          조리법을 저장하고 관리하려면 로그인이 필요합니다.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">조리법 목록</h1>
          <Link
            href="/recipes/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            + 새 조리법
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            가나다순
          </button>
          <button
            onClick={() => setSortBy('updated')}
            className={`px-3 py-1 rounded text-sm ${
              sortBy === 'updated'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            최근 수정순
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 조리법이 없습니다.</p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 조리법 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <h2 className="text-lg font-semibold mb-1">{recipe.title}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(recipe.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/recipes/${recipe.id}/experiments`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    실험 목록
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

