'use client'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({
  message = '로딩 중...',
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      <p className="mt-4 text-gray-500">{message}</p>
    </div>
  )
}

