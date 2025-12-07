"use server";

import { createClient } from "@/lib/supabase/server";
import { requireServerUser } from "@/lib/supabase/auth";
import { AuthorizationError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Database } from "@/types/database";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];

export type SortOption = "name" | "updated";

export async function createRecipe(): Promise<never> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Create recipe
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      title: "새 조리법",
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("조리법 생성에 실패했습니다.");
  }

  redirect(`/recipes/${data.id}`);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("조리법을 찾을 수 없습니다.");
  }

  return data;
}

export async function updateRecipeTitle(id: string, title: string): Promise<Recipe> {
  const user = await requireServerUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns the recipe
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new AuthorizationError();
  }

  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes");
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  const user = await requireServerUser();
  const supabase = await createClient();

  const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", user.id); // Ensure user owns the recipe

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/recipes");
}

export async function getRecipes(sortBy: SortOption = "updated"): Promise<Recipe[]> {
  const user = await requireServerUser();
  const supabase = await createClient();

  let query = supabase.from("recipes").select("*").eq("user_id", user.id);

  if (sortBy === "name") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
