'use client'

import { useState } from 'react'
import { deleteExperiment } from '@/app/recipes/[id]/experiments/actions'
import EmptyState from '@/components/shared/EmptyState'
import Link from 'next/link'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

export interface ExperimentWithPhotos extends Experiment {
  photos: Photo[]
  thumbnail?: string
}

interface ExperimentsClientProps {
  experiments: ExperimentWithPhotos[]
  recipeId: string
}

export default function ExperimentsClient({ experiments, recipeId }: ExperimentsClientProps) {
  // TODO: experimentsList 를 지역 상태로 관리할 필요가 있는지 검증하기
  const [experimentsList, setExperimentsList] = useState(experiments)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteExperiment(id)
      // Remove deleted experiment from list
      setExperimentsList(experimentsList.filter((exp) => exp.id !== id))
      setDeleteConfirm(null)
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <div className="min-h-screen pb-20">
        {/* TODO: 헤더를 별도의 컴포넌트로 분리하기 */}
        <header className="grid grid-cols-3 items-center sticky top-0 bg-white border-b border-gray-200 z-10 px-4 py-3">
            <Link
              href={`/recipes/${recipeId}`}
              className="w-fit text-blue-600 hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="조리법으로 돌아가기"
            >
              ← 돌아가기
            </Link>
            <h1 className="text-xl font-bold text-center">실험 목록</h1>
        </header>

        <div className="px-4 py-4">
          {experimentsList.length === 0 ? (
            <EmptyState
              title="아직 실험 결과가 없습니다."
            />
          ) : (
            <div className="space-y-4" role="list" aria-label="실험 목록">
              {experimentsList.map((experiment) => (
                <article
                  key={experiment.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  aria-labelledby={`experiment-${experiment.id}`}
                >
                  <Link href={`/recipes/${recipeId}/experiments/${experiment.id}`}>
                    <div className="flex gap-4 p-4">
                      {experiment.thumbnail && (
                        // TODO: img 를 Image 로 리팩토링하기
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

