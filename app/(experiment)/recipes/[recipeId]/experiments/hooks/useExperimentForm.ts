"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { ExperimentFormSchema, type ExperimentFormData } from "@/lib/validations/experiment";
import { RECIPE_LIMITS } from "@/lib/constants/recipe";

interface UseExperimentFormResult {
  form: UseFormReturn<ExperimentFormData>;
  previews: string[];
  handlePhotoChange: (files: File[]) => void;
  removePhoto: (index: number) => void;
}

export function useExperimentForm(): UseExperimentFormResult {
  const form = useForm<ExperimentFormData>({
    resolver: zodResolver(ExperimentFormSchema),
    defaultValues: {
      memo: "",
      photos: [],
    },
  });

  const watchedPhotos = form.watch("photos");
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate previews when photos change
  useEffect(() => {
    const newPreviews: string[] = [];
    const previewPromises = watchedPhotos.map(
      file =>
        new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then(results => {
      setPreviews(results);
    });
  }, [watchedPhotos]);

  const handlePhotoChange = (files: File[]) => {
    const currentPhotos = form.getValues("photos");
    if (currentPhotos.length + files.length > RECIPE_LIMITS.MAX_EXPERIMENT_PHOTOS) {
      form.setError("photos", {
        type: "manual",
        message: "최대 9장까지 업로드 가능합니다",
      });
      return;
    }
    form.setValue("photos", [...currentPhotos, ...files], { shouldDirty: true });
  };

  const removePhoto = (index: number) => {
    const currentPhotos = form.getValues("photos");
    form.setValue(
      "photos",
      currentPhotos.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  return {
    form,
    previews,
    handlePhotoChange,
    removePhoto,
  };
}
