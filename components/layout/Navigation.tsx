'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { PencilIcon, ClipboardIcon } from '@/components/icons'

export default function Navigation() {
  const pathname = usePathname()
  const params = useParams()
  const recipeId = params.id as string | undefined

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto"
      aria-label="주요 네비게이션"
    >
      <div className="flex items-center justify-around h-16" role="list">
        {recipeId && (
          <>
            <Link
              href={`/recipes/${recipeId}/experiments/new`}
              className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                pathname === `/recipes/${recipeId}/experiments/new` ? 'text-green-600' : 'text-gray-600'
              }`}
              aria-label="실험 저장"
              aria-current={pathname === `/recipes/${recipeId}/experiments/new` ? 'page' : undefined}
            >
              <PencilIcon className="w-6 h-6 mb-1" />
              <span className="text-xs">실험 저장</span>
            </Link>
            <Link
              href={`/recipes/${recipeId}/experiments`}
              className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded ${
                pathname === `/recipes/${recipeId}/experiments` ? 'text-blue-600' : 'text-gray-600'
              }`}
              aria-label="실험 목록"
              aria-current={pathname === `/recipes/${recipeId}/experiments` ? 'page' : undefined}
            >
              <ClipboardIcon className="w-6 h-6 mb-1" />
              <span className="text-xs">실험 목록</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

