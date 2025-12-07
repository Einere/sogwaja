'use client'

import ErrorMessage from '@/components/shared/ErrorMessage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorMessage
      message={error.message || '오류가 발생했습니다.'}
      onRetry={reset}
      retryLabel="다시 시도"
    />
  )
}

