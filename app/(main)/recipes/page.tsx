'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRecipeList } from '@/app/recipes/hooks/useRecipeList'
import RecipeList from '@/app/recipes/components/RecipeList'
import RecipeListHeader from '@/app/recipes/components/RecipeListHeader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import EmptyState from '@/components/shared/EmptyState'
import ErrorMessage from '@/components/shared/ErrorMessage'
import Link from 'next/link'

export default function RecipesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    recipes,
    loading,
    error,
    sortBy,
    setSortBy,
    handleDelete,
  } = useRecipeList()

  if (authLoading || loading) {
    return <LoadingSpinner message="로딩 중..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => router.push('/recipes')}
        retryLabel="다시 시도"
      />
    )
  }

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-gray-600 mb-4 text-center">
          조리법을 저장하고 관리하려면 로그인이 필요합니다.
        </p>
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="로그인하기"
        >
          로그인하기
        </Link>
      </main>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <RecipeListHeader sortBy={sortBy} onSortChange={setSortBy} />
      <div className="px-4 py-4">
        {recipes.length === 0 ? (
          <EmptyState
            title="아직 조리법이 없습니다."
            action={{
              label: '첫 조리법 만들기',
              href: '/recipes/new',
            }}
          />
        ) : (
          <RecipeList recipes={recipes} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}
