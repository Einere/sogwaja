'use client'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export default function ErrorMessage({
  message,
  onRetry,
  retryLabel = '다시 시도',
}: ErrorMessageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="text-red-600 mb-4" aria-hidden="true">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-red-600 mb-2">오류 발생</h2>
      <p className="text-gray-700 mb-4 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          aria-label={retryLabel}
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

