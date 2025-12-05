'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => pathname === path

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/recipes"
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/recipes') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-xs">조리법</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-600"
        >
          <svg
            className="w-6 h-6 mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-xs">로그아웃</span>
        </button>
      </div>
    </nav>
  )
}

