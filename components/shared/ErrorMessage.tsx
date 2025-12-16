"use client";

import { Button } from "@/components/ui";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorMessage({
  message,
  onRetry,
  retryLabel = "다시 시도",
}: ErrorMessageProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-error mb-4" aria-hidden="true">
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-error mb-2 text-xl font-bold">오류 발생</h2>
      <p className="text-foreground mb-4 max-w-md text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} aria-label={retryLabel}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
