"use server";

import { createClient } from "@/lib/supabase/server";
import { requireServerUser } from "@/lib/supabase/auth";
import { AuthorizationError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Database } from "@/types/database";
import { getRecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import type { RecipeData } from "@/app/(recipe-editor)/recipes/[recipeId]/actions";
import type { Json } from "@/types/database";

type Experiment = Database["public"]["Tables"]["recipe_experiments"]["Row"];
type Photo = Database["public"]["Tables"]["experiment_photos"]["Row"];

export interface ExperimentWithPhotos extends Experiment {
  photos: Photo[];
  thumbnail?: string;
}

export async function getExperiments(recipeId: string): Promise<ExperimentWithPhotos[]> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("user_id", user.id)
    .single();

  if (recipeError || !recipe) {
    throw new AuthorizationError();
  }

  // Load experiments with photos in a single query using JOIN
  const { data: experimentsData, error: experimentsError } = await supabase
    .from("recipe_experiments")
    .select(
      `
      *,
      experiment_photos (*)
    `
    )
    .eq("recipe_id", recipeId)
    .order("created_at", { ascending: false });

  if (experimentsError) {
    throw new Error(experimentsError.message);
  }

  // Transform the data to match the expected format
  const experimentsWithPhotos = (experimentsData || []).map(experiment => {
    const photos = (experiment.experiment_photos as Photo[] | null) || [];
    // Sort photos by order
    photos.sort((a, b) => a.order - b.order);
    const thumbnail = photos[0]?.url;

    // Remove the nested experiment_photos from the experiment object
    const { experiment_photos: _, ...experimentWithoutPhotos } = experiment as Experiment & {
      experiment_photos: Photo[] | null;
    };

    return {
      ...experimentWithoutPhotos,
      photos,
      thumbnail,
    };
  });

  return experimentsWithPhotos;
}

export async function getExperiment(experimentId: string): Promise<ExperimentWithPhotos> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Load experiment with photos and verify recipe ownership in a single query
  const { data: experimentData, error: experimentError } = await supabase
    .from("recipe_experiments")
    .select(
      `
      *,
      experiment_photos (*),
      recipes!inner(id, user_id)
    `
    )
    .eq("id", experimentId)
    .eq("recipes.user_id", user.id)
    .single();

  if (experimentError) {
    notFound();
  }

  const photos = (experimentData.experiment_photos as Photo[] | null) || [];
  // Sort photos by order
  photos.sort((a, b) => a.order - b.order);
  const thumbnail = photos[0]?.url;

  // Remove nested objects from the experiment object
  const {
    experiment_photos: _,
    recipes: __,
    ...experimentWithoutNested
  } = experimentData as Experiment & {
    experiment_photos: Photo[] | null;
    recipes: { id: string; user_id: string };
  };

  return {
    ...experimentWithoutNested,
    photos,
    thumbnail,
  };
}

export async function getExperimentData(experimentId: string): Promise<RecipeData> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Load experiment and verify ownership
  const { data: experimentData, error: experimentError } = await supabase
    .from("recipe_experiments")
    .select(
      `
      *,
      recipes!inner(id, user_id, title, created_at, updated_at)
    `
    )
    .eq("id", experimentId)
    .eq("recipes.user_id", user.id)
    .single();

  if (experimentError || !experimentData) {
    notFound();
  }

  const recipe = (experimentData.recipes as unknown as {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
  })!;

  // Check if archived data exists by checking experiment_steps table
  // This is the most reliable indicator since steps are always archived
  const { data: stepsCheck } = await supabase
    .from("experiment_steps")
    .select("id")
    .eq("experiment_id", experimentId)
    .maybeSingle();

  // If no archived steps exist, this is an old experiment - use current recipe data
  if (!stepsCheck) {
    return getRecipeData(recipe.id);
  }

  // Load archived data in parallel
  const [
    { data: equipmentData },
    { data: ingredientsData },
    { data: outputsData },
    { data: stepsData },
  ] = await Promise.all([
    // Load archived equipment
    supabase
      .from("experiment_equipment")
      .select("*")
      .eq("experiment_id", experimentId)
      .order("created_at"),
    // Load archived ingredients
    supabase
      .from("experiment_ingredients")
      .select("*")
      .eq("experiment_id", experimentId)
      .order("created_at"),
    // Load archived outputs
    supabase
      .from("experiment_outputs")
      .select("*")
      .eq("experiment_id", experimentId)
      .order("created_at"),
    // Load archived steps
    supabase.from("experiment_steps").select("*").eq("experiment_id", experimentId).maybeSingle(),
  ]);

  // Always use archived data if it exists (even if some arrays are empty)
  // Convert archived data to match RecipeData format
  return {
    recipe,
    equipment:
      equipmentData?.map(eq => ({
        id: eq.id,
        recipe_id: recipe.id,
        name: eq.name,
        quantity: eq.quantity,
        unit: eq.unit,
        created_at: eq.created_at,
      })) || [],
    ingredients:
      ingredientsData?.map(ing => ({
        id: ing.id,
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        created_at: ing.created_at,
      })) || [],
    outputs:
      outputsData?.map(out => ({
        id: out.id,
        recipe_id: recipe.id,
        name: out.name,
        quantity: out.quantity,
        unit: out.unit,
        created_at: out.created_at,
      })) || [],
    steps: (stepsData?.content as Json) || null,
  };
}

export async function createExperiment(
  recipeId: string,
  memo: string | null,
  photos: File[]
): Promise<Experiment> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Verify recipe ownership and get current recipe data for archiving
  const recipeData = await getRecipeData(recipeId);

  // Create experiment
  const { data: experiment, error: experimentError } = await supabase
    .from("recipe_experiments")
    .insert({
      recipe_id: recipeId,
      memo: memo || null,
    })
    .select()
    .single();

  if (experimentError) {
    // TODO: supabase 에러가 직접적으로 노출되지 않도록 수정하기
    throw new Error(experimentError.message);
  }

  // Archive recipe data snapshot
  if (experiment) {
    // Archive equipment
    if (recipeData.equipment.length > 0) {
      const archivedEquipment = recipeData.equipment.map(eq => ({
        experiment_id: experiment.id,
        name: eq.name,
        quantity: eq.quantity,
        unit: eq.unit,
      }));

      const { error: equipmentError } = await supabase
        .from("experiment_equipment")
        .insert(archivedEquipment);

      if (equipmentError) {
        console.error("Error archiving equipment:", equipmentError);
        // Continue even if archiving fails
      }
    }

    // Archive ingredients
    if (recipeData.ingredients.length > 0) {
      const archivedIngredients = recipeData.ingredients.map(ing => ({
        experiment_id: experiment.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
      }));

      const { error: ingredientsError } = await supabase
        .from("experiment_ingredients")
        .insert(archivedIngredients);

      if (ingredientsError) {
        console.error("Error archiving ingredients:", ingredientsError);
        // Continue even if archiving fails
      }
    }

    // Archive outputs
    if (recipeData.outputs.length > 0) {
      const archivedOutputs = recipeData.outputs.map(out => ({
        experiment_id: experiment.id,
        name: out.name,
        quantity: out.quantity,
        unit: out.unit,
      }));

      const { error: outputsError } = await supabase
        .from("experiment_outputs")
        .insert(archivedOutputs);

      if (outputsError) {
        console.error("Error archiving outputs:", outputsError);
        // Continue even if archiving fails
      }
    }

    // Archive steps (always archive, even if null, to mark that archiving was attempted)
    const { error: stepsError } = await supabase.from("experiment_steps").insert({
      experiment_id: experiment.id,
      content: recipeData.steps || null,
    });

    if (stepsError) {
      console.error("Error archiving steps:", stepsError);
      // Continue even if archiving fails
    }
  }

  // Upload photos if any
  if (photos.length > 0 && experiment) {
    const photoUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      const filePath = `${user.id}/${experiment.id}/${fileName}`;

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("experiment-photos")
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Error uploading photo:", uploadError);
        continue; // Skip failed uploads but continue with others
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("experiment-photos").getPublicUrl(filePath);

      photoUrls.push(publicUrl);
    }

    // Save photo records
    if (photoUrls.length > 0) {
      const photoRecords = photoUrls.map((url, index) => ({
        experiment_id: experiment.id,
        url,
        order: index,
      }));

      const { error: photosError } = await supabase.from("experiment_photos").insert(photoRecords);

      if (photosError) {
        console.error("Error saving photo records:", photosError);
        // Don't fail the whole operation if photo records fail
      }
    }
  }

  revalidatePath(`/recipes/${recipeId}/experiments`);
  return experiment;
}

export async function createExperimentAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const recipeId = formData.get("recipeId") as string;
  const memo = formData.get("memo") as string | null;
  const photoFiles = formData.getAll("photos") as File[];

  if (!recipeId) {
    return { error: "레시피 ID가 필요합니다." };
  }
  // Filter out empty files
  const photos = photoFiles.filter(file => file.size > 0);

  if (photos.length > 9) {
    return { error: "최대 9장까지 업로드 가능합니다." };
  }

  try {
    await createExperiment(recipeId, memo || null, photos);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "실험 결과 저장 중 오류가 발생했습니다.";
    return { error: errorMessage };
  }

  return redirect(`/recipes/${recipeId}/experiments`);
}

export async function deleteExperiment(experimentId: string): Promise<void> {
  const user = await requireServerUser();
  const supabase = await createClient();

  // Load experiment to get recipe_id
  const { data: experiment, error: experimentError } = await supabase
    .from("recipe_experiments")
    .select("recipe_id")
    .eq("id", experimentId)
    .single();

  if (experimentError) {
    throw new Error(experimentError.message);
  }

  // Verify recipe ownership
  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", experiment.recipe_id)
    .eq("user_id", user.id)
    .single();

  if (recipeError || !recipe) {
    throw new AuthorizationError();
  }

  // Get photos to delete from storage
  const { data: photos } = await supabase
    .from("experiment_photos")
    .select("url")
    .eq("experiment_id", experimentId);

  // Delete photos from storage
  if (photos && photos.length > 0) {
    for (const photo of photos) {
      const fileName = photo.url.split("/").pop();
      if (fileName) {
        await supabase.storage
          .from("experiment-photos")
          .remove([`${user.id}/${experimentId}/${fileName}`]);
      }
    }
  }

  // Delete experiment (cascade will delete photos)
  const { error } = await supabase.from("recipe_experiments").delete().eq("id", experimentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/recipes/${experiment.recipe_id}/experiments`);
}
