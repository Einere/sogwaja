'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  children?: ReactNode
}

export default function EmptyState({
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div
      className="text-center py-12"
      role="status"
      aria-live="polite"
      aria-label={`${title}. ${description || ''}`}
    >
      <p className="text-gray-500 mb-4">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          aria-label={action.label}
        >
          {action.label}
        </Link>
      )}
      {children}
    </div>
  )
}

