import { createRecipe } from '@/app/recipes/actions'
import { redirect } from 'next/navigation'

export default async function NewRecipePage() {
  const recipe = await createRecipe()
  redirect(`/recipes/${recipe.id}`)
}
