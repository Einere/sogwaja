"use client";

import { useRouter } from "next/navigation";
import { deleteExperiment } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import EquipmentEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/EquipmentEditor";
import IngredientEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/IngredientEditor";
import OutputEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/OutputEditor";
import StepEditor from "@/app/(recipes)/recipes/components/RecipeFormFields/StepEditor";
import { LinkButton, Button } from "@/components/ui";
import { ArrowLeftIcon } from "@/components/icons";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";
import type { Descendant } from "slate";
import type { ExperimentWithPhotos } from "../../../../../(experiments)/recipes/[recipeId]/experiments/ExperimentsClient";
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

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

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
        <header className="bg-background border-border sticky top-0 z-10 grid grid-cols-3 items-center border-b px-4 py-3">
          <LinkButton
            href={`/recipes/${recipeId}/experiments`}
            variant="link"
            size="sm"
            className="flex w-fit items-center gap-1"
            aria-label="실험 목록으로 돌아가기"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            목록으로
          </LinkButton>
          <h1 className="text-center text-xl font-bold">실험 결과</h1>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="text-error hover:text-error w-fit justify-end justify-self-end text-end"
            aria-label="실험 삭제"
          >
            삭제
          </Button>
        </header>

        <main className="space-y-6 px-4 py-6">
          <section>
            <h2 className="mb-2 text-2xl font-bold">{recipe.title}</h2>
            <time className="text-muted-foreground text-sm" dateTime={experiment.created_at}>
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
                className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2"
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
                    className="h-48 w-48 flex-shrink-0 rounded object-cover"
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
              <div className="bg-muted rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap">{experiment.memo}</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
