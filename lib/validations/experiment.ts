import { z } from "zod";
import { RECIPE_LIMITS } from "@/lib/constants/recipe";

export const ExperimentFormSchema = z.object({
  memo: z.string(),
  photos: z
    .array(z.instanceof(File))
    .max(RECIPE_LIMITS.MAX_EXPERIMENT_PHOTOS, "최대 9장까지 업로드 가능합니다"),
});

export type ExperimentFormData = z.infer<typeof ExperimentFormSchema>;
