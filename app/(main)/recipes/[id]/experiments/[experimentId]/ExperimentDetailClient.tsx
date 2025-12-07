"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteExperiment } from "@/app/recipes/[id]/experiments/actions";
import EquipmentEditor from "@/app/recipes/components/RecipeFormFields/EquipmentEditor";
import IngredientEditor from "@/app/recipes/components/RecipeFormFields/IngredientEditor";
import OutputEditor from "@/app/recipes/components/RecipeFormFields/OutputEditor";
import StepEditor from "@/app/recipes/components/RecipeFormFields/StepEditor";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import TextLink from "@/components/ui/TextLink";
import Button from "@/components/ui/Button";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";
import type { Descendant } from "slate";
import type { ExperimentWithPhotos } from "../ExperimentsClient";
import Image from "next/image";

type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
type Equipment = Database["public"]["Tables"]["recipe_equipment"]["Row"];
type Ingredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
type Output = Database["public"]["Tables"]["recipe_outputs"]["Row"];
type Photo = Database["public"]["Tables"]["experiment_photos"]["Row"];

interface ExperimentDetailClientProps {
  experiment: ExperimentWithPhotos;
  recipe: Recipe;
  equipment: Equipment[];
  ingredients: Ingredient[];
  outputs: Output[];
  steps: Json | null;
  recipeId: string;
  experimentId: string;
}

export default function ExperimentDetailClient({
  experiment,
  recipe,
  equipment,
  ingredients,
  outputs,
  steps,
  recipeId,
  experimentId,
}: ExperimentDetailClientProps) {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteExperiment(experimentId);
      router.push(`/recipes/${recipeId}/experiments`);
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const initialSteps: { children: Descendant[] } =
    steps && typeof steps === "object" && "children" in steps
      ? (steps as unknown as { children: Descendant[] })
      : {
          children: [{ type: "paragraph", children: [{ text: "" }] }] as unknown as Descendant[],
        };

  return (
    <>
      <div className="min-h-screen pb-20">
        {/* TODO: 헤더 컴포넌트를 서버 컴포넌트로 별도로 분리하고(layout 으로 만들어도 괜찮음), 삭제 버튼은 children 을 받는 방식으로 변경하여 서버 컴포넌트 영역을 최대한 넓히기  */}
        <header className="sticky top-0 bg-background border-b border-border z-10 px-4 py-3 grid grid-cols-3 items-center">
          <TextLink
            href={`/recipes/${recipeId}/experiments`}
            size="sm"
            className="w-fit"
            aria-label="실험 목록으로 돌아가기"
          >
            ← 목록으로
          </TextLink>
          <h1 className="text-xl font-bold text-center">실험 결과</h1>
          <Button
            onClick={() => setDeleteConfirm(true)}
            variant="ghost"
            size="sm"
            className="justify-self-end w-fit text-end text-error hover:text-error hover:underline p-0 h-auto justify-end"
            aria-label="실험 삭제"
          >
            삭제
          </Button>
        </header>

        <main className="px-4 py-6 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
            <time className="text-sm text-muted-foreground" dateTime={experiment.created_at}>
              {/* TODO: day.js 로 리팩토링하기 */}
              {new Date(experiment.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </section>

          <EquipmentEditor
            equipment={equipment}
            onUpdate={() => {}}
            outputQuantity={outputs[0]?.quantity}
            outputUnit={outputs[0]?.unit}
            readOnly={true}
          />

          <IngredientEditor
            ingredients={ingredients}
            onUpdate={() => {}}
            outputQuantity={outputs[0]?.quantity}
            outputUnit={outputs[0]?.unit}
            readOnly={true}
          />

          <OutputEditor outputs={outputs} onUpdate={() => {}} readOnly={true} />

          {steps && (
            <section className="space-y-3" aria-labelledby="steps-heading">
              <h3 id="steps-heading" className="text-lg font-semibold">
                조리법 흐름
              </h3>
              <StepEditor
                value={initialSteps}
                onChange={() => {}}
                equipment={equipment}
                ingredients={ingredients}
                readOnly={true}
              />
            </section>
          )}

          {/* TOOD: 별도의 컴포넌트로 리팩토링 */}
          {experiment.photos && experiment.photos.length > 0 && (
            <section className="space-y-3" aria-labelledby="photos-heading">
              <h3 id="photos-heading" className="text-lg font-semibold">
                사진
              </h3>
              <div
                className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4"
                role="list"
                aria-label="실험 사진"
              >
                {experiment.photos.map((photo: Photo) => (
                  <Image
                    key={photo.id}
                    src={photo.url}
                    width={192}
                    height={192}
                    alt="실험 사진"
                    className="flex-shrink-0 w-48 h-48 object-cover rounded"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          )}

          {/* TOOD: 별도의 컴포넌트로 리팩토링 */}
          {experiment.memo && (
            <section className="space-y-3" aria-labelledby="memo-heading">
              <h3 id="memo-heading" className="text-lg font-semibold">
                메모
              </h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{experiment.memo}</p>
              </div>
            </section>
          )}
        </main>
      </div>
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="실험 삭제"
        message="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="error"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </>
  );
}
