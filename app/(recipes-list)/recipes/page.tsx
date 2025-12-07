import { Suspense } from 'react'
import { getServerUser } from '@/lib/supabase/auth'
import { getRecipes, type SortOption } from '@/app/recipes/actions'
import RecipeListHeader from '@/app/recipes/components/RecipeListHeader'
import RecipeListContent from '@/app/recipes/components/RecipeListContent'
import EmptyState from '@/components/shared/EmptyState'
import Link from 'next/link'

interface RecipesPageProps {
  searchParams: Promise<{
    sort?: string
  }> | {
    sort?: string
  }
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  // TODO: auth guard 로직은 분리해야 함.
  const user = await getServerUser()

  if (!user) {
    return (
      // TODO: 별도의 컴포넌트로 분리하기
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

  // Handle searchParams - it might be a Promise in Next.js 16
  const params = searchParams instanceof Promise ? await searchParams : searchParams

  // Validate and set sort option
  const sortBy: SortOption =
    params.sort === 'name' || params.sort === 'updated'
      ? params.sort
      : 'updated'
  
  // Fetch recipes from server
  const recipes = await getRecipes(sortBy)

  return (
    <div className="min-h-screen">
      {/* TODO: Suspense로 감쌀 필요가 있는지 검증하기 */}
      <Suspense
        fallback={
          <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">조리법 목록</h1>
            </div>
          </header>
        }
      >
        <RecipeListHeader />
      </Suspense>
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
          <RecipeListContent recipes={recipes} />
        )}
      </div>
    </div>
  )
}

