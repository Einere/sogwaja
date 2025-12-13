"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteExperiment } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import EmptyState from "@/components/shared/EmptyState";
import TextLink from "@/components/ui/TextLink";
import { ArrowLeftIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Link from "next/link";
import type { Database } from "@/types/database";

type Experiment = Database["public"]["Tables"]["recipe_experiments"]["Row"];
type Photo = Database["public"]["Tables"]["experiment_photos"]["Row"];

export interface ExperimentWithPhotos extends Experiment {
  photos: Photo[];
  thumbnail?: string;
}

interface ExperimentsClientProps {
  experiments: ExperimentWithPhotos[];
  recipeId: string;
}

export default function ExperimentsClient({ experiments, recipeId }: ExperimentsClientProps) {
  const [experimentsList, setExperimentsList] = useState(experiments);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // 서버에서 받은 experiments가 변경되면 로컬 state 업데이트
  useEffect(() => {
    setExperimentsList(experiments);
  }, [experiments]);

  const handleDelete = async (id: string) => {
    // 1. 이전 상태 저장 (롤백용)
    const previousExperiments = experimentsList;

    // 2. 즉시 목록에서 제거 (낙관적)
    setExperimentsList(prev => prev.filter(exp => exp.id !== id));
    setDeleteConfirm(null);

    try {
      // 3. 백그라운드에서 서버 요청
      await deleteExperiment(id);
    } catch (err) {
      // 5. 실패 시 롤백
      setExperimentsList(previousExperiments);
      const errorMessage = err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  return (
    <>
      <div className="min-h-screen pb-20">
        {/* TODO: 헤더를 별도의 컴포넌트로 분리하기 */}
        <header className="grid grid-cols-3 items-center sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
          <TextLink
            href={`/recipes/${recipeId}`}
            size="sm"
            className="w-fit flex items-center gap-1"
            aria-label="조리법으로 돌아가기"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            돌아가기
          </TextLink>
          <h1 className="text-xl font-bold text-center">실험 목록</h1>
        </header>

        <div className="px-4 py-4">
          {experimentsList.length === 0 ? (
            <EmptyState title="아직 실험 결과가 없습니다." />
          ) : (
            <div className="space-y-4" role="list" aria-label="실험 목록">
              {experimentsList.map(experiment => (
                <Card
                  key={experiment.id}
                  className="overflow-hidden"
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
                          className="text-sm text-muted-foreground mb-1 block"
                          dateTime={experiment.created_at}
                        >
                          {new Date(experiment.created_at).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        {experiment.memo ? (
                          <p className="text-sm text-foreground line-clamp-2">{experiment.memo}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">메모 없음</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <Button
                      onClick={() => setDeleteConfirm({ id: experiment.id, name: "실험" })}
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error"
                      aria-label="실험 삭제"
                    >
                      삭제
                    </Button>
                  </div>
                </Card>
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
        variant="error"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
