'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['recipe_experiments']['Row']
type Photo = Database['public']['Tables']['experiment_photos']['Row']

interface ExperimentWithPhoto extends Experiment {
  photos: Photo[]
  thumbnail?: string
}

export default function ExperimentsPage() {
  const params = useParams()
  const router = useRouter()
  const recipeId = params.id as string
  const { user } = useAuth()
  const supabase = createClient()

  const [experiments, setExperiments] = useState<ExperimentWithPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadExperiments()
  }, [user, recipeId])

  const loadExperiments = async () => {
    try {
      const { data: experimentsData, error: experimentsError } = await supabase
        .from('recipe_experiments')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (experimentsError) throw experimentsError

      // Load photos for each experiment
      const experimentsWithPhotos = await Promise.all(
        (experimentsData || []).map(async (experiment) => {
          const { data: photosData } = await supabase
            .from('experiment_photos')
            .select('*')
            .eq('experiment_id', experiment.id)
            .order('order', { ascending: true })

          const photos = photosData || []
          const thumbnail = photos[0]?.url

          return {
            ...experiment,
            photos,
            thumbnail,
          }
        })
      )

      setExperiments(experimentsWithPhotos)
    } catch (error) {
      console.error('Error loading experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      // Delete photos from storage first
      const { data: photos } = await supabase
        .from('experiment_photos')
        .select('url')
        .eq('experiment_id', id)

      if (photos) {
        for (const photo of photos) {
          const fileName = photo.url.split('/').pop()
          if (fileName) {
            await supabase.storage
              .from('experiment-photos')
              .remove([`${user?.id}/${id}/${fileName}`])
          }
        }
      }

      // Delete experiment (cascade will delete photos)
      const { error } = await supabase
        .from('recipe_experiments')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadExperiments()
    } catch (error) {
      console.error('Error deleting experiment:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    )
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
          <h1 className="text-xl font-bold">실험 목록</h1>
          <Link
            href={`/recipes/${recipeId}/experiments/new`}
            className="text-blue-600 hover:underline text-sm"
          >
            + 새 실험
          </Link>
        </div>
      </div>

      <div className="px-4 py-4">
        {experiments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">아직 실험 결과가 없습니다.</p>
            <Link
              href={`/recipes/${recipeId}/experiments/new`}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 실험 저장하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <Link href={`/recipes/${recipeId}/experiments/${experiment.id}`}>
                  <div className="flex gap-4 p-4">
                    {experiment.thumbnail && (
                      <img
                        src={experiment.thumbnail}
                        alt="Experiment thumbnail"
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        {new Date(experiment.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {experiment.memo && (
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {experiment.memo}
                        </p>
                      )}
                      {!experiment.memo && (
                        <p className="text-sm text-gray-400">메모 없음</p>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleDelete(experiment.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

