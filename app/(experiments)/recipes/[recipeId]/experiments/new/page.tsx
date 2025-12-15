"use client";

import { useParams, useRouter } from "next/navigation";
import { useActionState, startTransition } from "react";
import { createExperimentAction } from "@/app/(experiments)/recipes/[recipeId]/experiments/actions";
import { useExperimentForm } from "@/app/(experiment)/recipes/[recipeId]/experiments/hooks/useExperimentForm";
import { Textarea, Button, LinkButton } from "@/components/ui";
import { XIcon, ArrowLeftIcon, PlusIcon } from "@/components/icons";
import { SsgoiTransition } from "@ssgoi/react";

export default function NewExperimentPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;
  const { memo, photos, previews, setMemo, handlePhotoChange, removePhoto } = useExperimentForm();

  const [state, formAction, isPending] = useActionState(createExperimentAction, null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isPending) return;

    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 9) {
      alert("최대 9장까지 업로드 가능합니다.");
      return;
    }
    handlePhotoChange(files);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("recipeId", recipeId);
    formData.append("memo", memo || "");

    // Add photos to FormData
    photos.forEach(photo => {
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
      <header className="grid grid-cols-3 items-center sticky top-0 bg-background border-b border-border z-10 px-4 py-3">
        <LinkButton
          href={`/recipes/${recipeId}`}
          variant="link"
          size="sm"
          className="w-fit flex items-center gap-1"
          aria-label="조리법으로 돌아가기"
          prefetch={true}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          돌아가기
        </LinkButton>
        <h1 className="text-center text-xl font-bold">실험 결과 저장</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6" aria-label="실험 결과 저장 폼">
        <fieldset disabled={isPending}>
          <legend className="block text-sm font-medium text-foreground mb-2">사진</legend>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`미리보기 ${index + 1}`}
                  className="w-full aspect-square object-cover rounded"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={isPending}
                  className="absolute top-1 right-1 bg-muted-foreground/50 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-foreground/70 transition-colors"
                  aria-label={`사진 ${index + 1} 삭제`}
                >
                  <XIcon className="w-4 h-4 text-error" />
                </button>
              </div>
            ))}
            {previews.length < 9 && (
              <label
                tabIndex={isPending ? -1 : 0}
                className={`flex w-full aspect-square items-center justify-center border-2 border-dashed rounded transition-colors ${
                  isPending
                    ? "border-muted cursor-not-allowed opacity-50"
                    : "border-input cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
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
                />
                <PlusIcon className="w-8 h-8 text-muted-foreground" />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground">최대 9장까지 업로드 가능합니다.</p>
        </fieldset>

        <Textarea
          label="메모"
          name="memo"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          disabled={isPending}
          rows={6}
          placeholder="실험 결과에 대한 메모를 입력하세요..."
          aria-label="실험 메모"
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
