'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function NewExperimentPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()

  const [memo, setMemo] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos([...photos, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setUploading(true)

    try {
      // Create experiment
      const { data: experiment, error: experimentError } = await supabase
        .from('recipe_experiments')
        .insert({
          recipe_id: recipeId,
          memo: memo || null,
        })
        .select()
        .single()

      if (experimentError) throw experimentError

      // Upload photos
      if (photos.length > 0 && experiment) {
        const photoUrls: string[] = []

        for (let i = 0; i < photos.length; i++) {
          const file = photos[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${i}.${fileExt}`
          const filePath = `${user.id}/${experiment.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('experiment-photos')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const {
            data: { publicUrl },
          } = supabase.storage.from('experiment-photos').getPublicUrl(filePath)

          photoUrls.push(publicUrl)
        }

        // Save photo records
        const photoRecords = photoUrls.map((url, index) => ({
          experiment_id: experiment.id,
          url,
          order: index,
        }))

        const { error: photosError } = await supabase
          .from('experiment_photos')
          .insert(photoRecords)

        if (photosError) throw photosError
      }

      router.push(`/recipes/${recipeId}/experiments`)
    } catch (error) {
      console.error('Error saving experiment:', error)
      alert('실험 결과 저장 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/recipes/${recipeId}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-xl font-bold">실험 결과 저장</h1>
          <div className="w-12" /> {/* Spacer */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            {previews.length < 9 && (
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <span className="text-2xl text-gray-400">+</span>
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">최대 9장까지 업로드 가능합니다.</p>
        </div>

        <Textarea
          label="메모"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={6}
          placeholder="실험 결과에 대한 메모를 입력하세요..."
        />

        <div className="flex gap-3 pt-4">
          <Link
            href={`/recipes/${recipeId}`}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-center hover:bg-gray-300"
          >
            취소
          </Link>
          <Button
            type="submit"
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}

