"use client";

import { useState, useEffect } from "react";
import { deleteExperiment } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import EmptyState from "@/components/shared/EmptyState";
import { LinkButton, Button, Card } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/icons";
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

  // 서버에서 받은 experiments가 변경되면 로컬 state 업데이트
  useEffect(() => {
    setExperimentsList(experiments);
  }, [experiments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    // 1. 이전 상태 저장 (롤백용)
    const previousExperiments = experimentsList;

    // 2. 즉시 목록에서 제거 (낙관적)
    setExperimentsList(prev => prev.filter(exp => exp.id !== id));

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
        <header className="bg-background border-border sticky top-0 z-10 grid grid-cols-3 items-center border-b px-4 py-3">
          <LinkButton
            href={`/recipes/${recipeId}`}
            variant="link"
            size="sm"
            className="flex w-fit items-center gap-1"
            aria-label="조리법으로 돌아가기"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            돌아가기
          </LinkButton>
          <h1 className="text-center text-xl font-bold">실험 목록</h1>
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
                          className="h-20 w-20 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <time
                          className="text-muted-foreground mb-1 block text-sm"
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
                          <p className="text-foreground line-clamp-2 text-sm">{experiment.memo}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm">메모 없음</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <Button
                      onClick={() => handleDelete(experiment.id)}
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
    </>
  );
}
