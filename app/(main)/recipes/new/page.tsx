'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createRecipe } from '@/app/recipes/actions'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function NewRecipePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const creatingRef = useRef(false)
  const createdRef = useRef(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (creatingRef.current || createdRef.current) {
      return
    }

    const createNewRecipe = async () => {
      creatingRef.current = true

      try {
        const result = await createRecipe()
        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data) {
          createdRef.current = true
          router.push(`/recipes/${result.data.id}`)
        }
      } catch (error) {
        console.error('Error creating recipe:', error)
        creatingRef.current = false
      }
    }

    createNewRecipe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading])

  if (authLoading) {
    return <LoadingSpinner message="조리법 생성 중..." />
  }

  if (!user) {
    return null
  }

  return <LoadingSpinner message="조리법 생성 중..." />
}
