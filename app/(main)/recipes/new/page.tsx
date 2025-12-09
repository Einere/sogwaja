import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/auth";
import { createRecipe } from "@/app/recipes/actions";

export default async function NewRecipePage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  await createRecipe();
  // createRecipe 내부에서 redirect가 처리되므로 여기 도달하지 않음
  return null;
}
