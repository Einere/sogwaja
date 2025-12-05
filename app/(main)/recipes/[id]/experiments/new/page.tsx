'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useExperimentForm } from '@/app/recipes/[id]/experiments/hooks/useExperimentForm'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function NewExperimentPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const {
    memo,
    photos,
    previews,
    uploading,
    error,
    setMemo,
    handlePhotoChange,
    removePhoto,
    handleSubmit,
  } = useExperimentForm()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 9) {
      alert('최대 9장까지 업로드 가능합니다.')
      return
    }
    handlePhotoChange(files)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    const result = await handleSubmit(recipeId)
    if (result.success) {
      router.push(`/recipes/${recipeId}/experiments`)
    } else if (result.error) {
      alert(result.error)
    }
  }

  if (authLoading) {
    return <LoadingSpinner message="로딩 중..." />
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href={`/recipes/${recipeId}`}
            className="text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="조리법으로 돌아가기"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-xl font-bold">실험 결과 저장</h1>
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      <form onSubmit={onSubmit} className="px-4 py-6 space-y-6" aria-label="실험 결과 저장 폼">
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            사진
          </legend>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`미리보기 ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`사진 ${index + 1} 삭제`}
                >
                  ×
                </button>
              </div>
            ))}
            {previews.length < 9 && (
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="사진 추가"
                />
                <span className="text-2xl text-gray-400" aria-hidden="true">+</span>
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">최대 9장까지 업로드 가능합니다.</p>
        </fieldset>

        <Textarea
          label="메모"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={6}
          placeholder="실험 결과에 대한 메모를 입력하세요..."
          aria-label="실험 메모"
        />

        {error && (
          <div role="alert" aria-live="assertive" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link
            href={`/recipes/${recipeId}`}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg text-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="취소"
          >
            취소
          </Link>
          <Button
            type="submit"
            disabled={uploading}
            className="flex-1"
            aria-label={uploading ? '저장 중' : '저장'}
          >
            {uploading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  )
}
