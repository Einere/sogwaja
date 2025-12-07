import { createRecipe } from "@/app/recipes/actions";

export default async function NewRecipePage() {
  await createRecipe();
  // createRecipe 내부에서 redirect가 처리되므로 여기 도달하지 않음
  return null;
}
