"use client";

import { useParams, useRouter } from "next/navigation";
import { useActionState, startTransition } from "react";
import { Controller } from "react-hook-form";
import { createExperimentAction } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import { useExperimentForm } from "@/app/(experiment)/recipes/[recipeId]/experiments/hooks/useExperimentForm";
import { Textarea, Button, LinkButton } from "@/components/ui";
import { XIcon, ArrowLeftIcon, PlusIcon } from "@/components/icons";

export default function NewExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;
  const { form, previews, handlePhotoChange, removePhoto } = useExperimentForm();

  const [state, formAction, isPending] = useActionState(createExperimentAction, null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPending) return;

    const files = Array.from(e.target.files || []);
    handlePhotoChange(files);
  };

  const onSubmit = (data: { memo?: string | null; photos: File[] }) => {
    const formData = new FormData();
    formData.append("recipeId", recipeId);
    formData.append("memo", data.memo || "");

    // Add photos to FormData
    data.photos.forEach(photo => {
      formData.append("photos", photo);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleCancel = () => {
    if (isPending) return;
    router.back();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* TODO: 헤더를 별도의 컴포넌트로 분리하기 */}
      <header className="bg-background border-border sticky top-0 z-10 grid grid-cols-3 items-center border-b px-4 py-3">
        <LinkButton
          href={`/recipes/${recipeId}`}
          variant="link"
          size="sm"
          className="flex w-fit items-center gap-1"
          aria-label="조리법으로 돌아가기"
          prefetch={true}
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          돌아가기
        </LinkButton>
        <h1 className="text-center text-xl font-bold">실험 결과 저장</h1>
      </header>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 px-4 py-6"
        aria-label="실험 결과 저장 폼"
      >
        <fieldset disabled={isPending}>
          <legend className="text-foreground mb-2 block text-sm font-medium">사진</legend>
          <div className="mb-2 grid grid-cols-3 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`미리보기 ${index + 1}`}
                  className="aspect-square w-full rounded object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={isPending}
                  className="bg-muted-foreground/50 focus:ring-ring hover:bg-muted-foreground/70 absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`사진 ${index + 1} 삭제`}
                >
                  <XIcon className="text-error h-4 w-4" />
                </button>
              </div>
            ))}
            {previews.length < 9 && (
              <label
                tabIndex={isPending ? -1 : 0}
                className={`flex aspect-square w-full items-center justify-center rounded border-2 border-dashed transition-colors ${
                  isPending
                    ? "border-muted cursor-not-allowed opacity-50"
                    : "border-input hover:border-primary focus:ring-ring focus-within:ring-ring cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                }`}
                onKeyDown={e => {
                  if (!isPending && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement;
                    input?.click();
                  }
                }}
                aria-label="사진 추가"
                aria-disabled={isPending}
                role="button"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="hidden"
                  aria-label="사진 추가"
                  aria-describedby="photo-upload-help"
                />
                <PlusIcon className="text-muted-foreground h-8 w-8" aria-hidden="true" />
              </label>
            )}
          </div>
          <p id="photo-upload-help" className="text-muted-foreground text-xs">
            최대 9장까지 업로드 가능합니다.
          </p>
          {form.formState.errors.photos && (
            // TODO: 모든 폼 인풋 경고 요소에 대해, 접근성 준수하기
            <p role="alert" className="text-error mt-1 text-sm">
              {form.formState.errors.photos.message}
            </p>
          )}
        </fieldset>

        <Controller
          name="memo"
          control={form.control}
          render={({ field }) => (
            <Textarea
              label="메모"
              name={field.name}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isPending}
              rows={6}
              placeholder="실험 결과에 대한 메모를 입력하세요..."
              aria-label="실험 메모"
              error={form.formState.errors.memo?.message}
            />
          )}
        />

        {state?.error && (
          <p role="alert" aria-live="assertive" className="text-error text-sm">
            {state.error}
          </p>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex-1"
            disabled={isPending}
            aria-label="취소"
          >
            취소
          </Button>
          <Button
            type="submit"
            loading={isPending}
            className="flex-1"
            aria-label={isPending ? "저장 중" : "저장"}
          >
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
