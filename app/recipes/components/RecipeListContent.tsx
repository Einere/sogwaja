'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipe } from '../actions'
import RecipeList from './RecipeList'
import type { Database } from '@/types/database'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeListContentProps {
  recipes: Recipe[]
}

export default function RecipeListContent({ recipes }: RecipeListContentProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeletingId(id)
    try {
      const result = await deleteRecipe(id)
      if (result.error) {
        alert('삭제 중 오류가 발생했습니다: ' + result.error)
        return
      }
      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  return <RecipeList recipes={recipes} onDelete={handleDelete} deletingId={deletingId} />
}

