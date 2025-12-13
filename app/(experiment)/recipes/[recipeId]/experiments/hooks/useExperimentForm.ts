"use client";

import { useState, useCallback } from "react";

interface UseExperimentFormResult {
  memo: string;
  photos: File[];
  previews: string[];
  setMemo: (memo: string) => void;
  handlePhotoChange: (files: File[]) => void;
  removePhoto: (index: number) => void;
  reset: () => void;
}

export function useExperimentForm(): UseExperimentFormResult {
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handlePhotoChange = useCallback(
    (files: File[]) => {
      const newPhotos = [...photos, ...files];
      setPhotos(newPhotos);

      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    },
    [photos]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setMemo("");
    setPhotos([]);
    setPreviews([]);
  }, []);

  return {
    memo,
    photos,
    previews,
    setMemo,
    handlePhotoChange,
    removePhoto,
    reset,
  };
}
