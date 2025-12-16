"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  message = "로딩 중...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className={`${sizeClasses[size]} border-muted border-t-primary animate-spin rounded-full border-4`}
        aria-hidden="true"
      />
      <p className="text-muted-foreground mt-4">{message}</p>
    </div>
  );
}
