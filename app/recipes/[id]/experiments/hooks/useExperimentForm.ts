'use client'

import { useState, useCallback } from 'react'
import { createExperiment } from '../actions'

interface UseExperimentFormResult {
  memo: string
  photos: File[]
  previews: string[]
  uploading: boolean
  error: string | null
  setMemo: (memo: string) => void
  handlePhotoChange: (files: File[]) => void
  removePhoto: (index: number) => void
  handleSubmit: (recipeId: string) => Promise<{ success: boolean; error?: string }>
  reset: () => void
}

export function useExperimentForm(): UseExperimentFormResult {
  const [memo, setMemo] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoChange = useCallback((files: File[]) => {
    const newPhotos = [...photos, ...files]
    setPhotos(newPhotos)

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [photos])

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async (recipeId: string) => {
    setUploading(true)
    setError(null)

    try {
      const result = await createExperiment(recipeId, memo || null, photos)
      if (result.error) {
        setError(result.error)
        return { success: false, error: result.error }
      }
      return { success: true }
    } catch (err) {
      const errorMessage = '실험 결과 저장 중 오류가 발생했습니다.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }, [memo, photos])

  const reset = useCallback(() => {
    setMemo('')
    setPhotos([])
    setPreviews([])
    setError(null)
  }, [])

  return {
    memo,
    photos,
    previews,
    uploading,
    error,
    setMemo,
    handlePhotoChange,
    removePhoto,
    handleSubmit,
    reset,
  }
}

