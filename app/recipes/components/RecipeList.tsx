'use client'

import Link from 'next/link'
import type { Database } from '@/types/database'
import RecipeCard from './RecipeCard'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeListProps {
  recipes: Recipe[]
  onDelete: (id: string) => Promise<void>
}

export default function RecipeList({ recipes, onDelete }: RecipeListProps) {
  if (recipes.length === 0) {
    return null
  }

  return (
    <div className="space-y-2" role="list" aria-label="조리법 목록">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} />
      ))}
    </div>
  )
}

