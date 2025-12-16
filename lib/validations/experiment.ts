import { z } from "zod";

export const ExperimentFormSchema = z.object({
  memo: z.string(),
  photos: z.array(z.instanceof(File)).max(9, "최대 9장까지 업로드 가능합니다"),
});

export type ExperimentFormData = z.infer<typeof ExperimentFormSchema>;
