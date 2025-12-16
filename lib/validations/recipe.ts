import { z } from "zod";

const UNIT_OPTIONS = ["개", "g", "ml"] as const;

export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "재료 이름을 입력해주세요"),
  amount: z.number().positive("양은 0보다 커야 합니다"),
  unit: z.enum(UNIT_OPTIONS, {
    message: "유효한 단위를 선택해주세요",
  }),
  recipe_id: z.string(),
  created_at: z.string(),
});

export const EquipmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "장비 이름을 입력해주세요"),
  quantity: z.number().positive("개수는 0보다 커야 합니다"),
  unit: z.enum(UNIT_OPTIONS, {
    message: "유효한 단위를 선택해주세요",
  }),
  recipe_id: z.string(),
  created_at: z.string(),
});

export const OutputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "결과물 이름을 입력해주세요"),
  quantity: z.number().positive("양은 0보다 커야 합니다"),
  unit: z.enum(UNIT_OPTIONS, {
    message: "유효한 단위를 선택해주세요",
  }),
  recipe_id: z.string(),
  created_at: z.string(),
});

export const StepSchema = z.any(); // Slate JSON은 복잡한 구조이므로 any로 처리

export const RecipeFormSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  ingredients: z.array(IngredientSchema),
  equipment: z.array(EquipmentSchema),
  outputs: z.array(OutputSchema),
  steps: StepSchema.nullable().optional(),
});

export type RecipeFormData = z.infer<typeof RecipeFormSchema>;
export type IngredientFormData = z.infer<typeof IngredientSchema>;
export type EquipmentFormData = z.infer<typeof EquipmentSchema>;
export type OutputFormData = z.infer<typeof OutputSchema>;
