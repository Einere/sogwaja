'use client'

import { createRecipe } from '@/app/recipes/actions'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function NewRecipePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(true)

  useEffect(() => {
    async function handleCreate() {
      try {
        const recipe = await createRecipe()
        router.push(`/recipes/${recipe.id}`)
      } catch (error) {
        console.error('Failed to create recipe:', error)
        router.push('/recipes')
      } finally {
        setIsCreating(false)
      }
    }
    
    handleCreate()
  }, [router])

  if (isCreating) {
    return <LoadingSpinner message="조리법을 생성하는 중..." />
  }

  return null
}
