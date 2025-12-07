'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getExperiments, deleteExperiment } from '@/app/recipes/[id]/experiments/actions'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ErrorMessage from '@/components/shared/ErrorMessage'
import EmptyState from '@/components/shared/EmptyState'
import Link from 'next/link'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

interface ExperimentWithPhotos extends Experiment {
  photos: Photo[]
  thumbnail?: string
}

export default function ExperimentsPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const [experiments, setExperiments] = useState<ExperimentWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  const loadExperiments = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getExperiments(recipeId)
      if (result.error) {
        setError(result.error)
        return
      }
      setExperiments(result.data || [])
    } catch {
      setError('실험 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExperiments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteExperiment(id)
      if (result.error) {
        throw new Error(result.error)
      }
      await loadExperiments()
      setDeleteConfirm(null)
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return <LoadingSpinner message="로딩 중..." />
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => router.push(`/recipes/${recipeId}`)}
        retryLabel="돌아가기"
      />
    )
  }

  return (
    <>
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
            <h1 className="text-xl font-bold">실험 목록</h1>
            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <div className="px-4 py-4">
          {experiments.length === 0 ? (
            <EmptyState
              title="아직 실험 결과가 없습니다."
              action={{
                label: '첫 실험 저장하기',
                href: `/recipes/${recipeId}/experiments/new`,
              }}
            />
          ) : (
            <div className="space-y-4" role="list" aria-label="실험 목록">
              {experiments.map((experiment) => (
                <article
                  key={experiment.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  aria-labelledby={`experiment-${experiment.id}`}
                >
                  <Link href={`/recipes/${recipeId}/experiments/${experiment.id}`}>
                    <div className="flex gap-4 p-4">
                      {experiment.thumbnail && (
                        <img
                          src={experiment.thumbnail}
                          alt="실험 썸네일"
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <time
                          className="text-sm text-gray-500 mb-1 block"
                          dateTime={experiment.created_at}
                        >
                          {new Date(experiment.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                        {experiment.memo ? (
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {experiment.memo}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400">메모 없음</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => setDeleteConfirm({ id: experiment.id, name: '실험' })}
                      className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      aria-label="실험 삭제"
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="실험 삭제"
        message="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  )
}
