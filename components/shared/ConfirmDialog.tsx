'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
      // Focus confirm button after a short delay to ensure dialog is rendered
      setTimeout(() => {
        confirmButtonRef.current?.focus()
      }, 100)
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-6 max-w-md w-full backdrop:bg-black/50"
      onKeyDown={handleKeyDown}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <h2 id="dialog-title" className="text-xl font-bold mb-4">
        {title}
      </h2>
      <p id="dialog-description" className="text-gray-700 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
          aria-label={cancelLabel}
        >
          {cancelLabel}
        </button>
        <button
          ref={confirmButtonRef}
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-white ${
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          aria-label={confirmLabel}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

