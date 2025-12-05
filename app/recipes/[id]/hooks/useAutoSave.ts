'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface UseAutoSaveOptions<T> {
  value: T
  onSave: (value: T) => Promise<void>
  enabled?: boolean
  debounceMs?: number
  compareFn?: (a: T, b: T) => boolean
}

export function useAutoSave<T>({
  value,
  onSave,
  enabled = true,
  debounceMs = 1000,
  compareFn,
}: UseAutoSaveOptions<T>) {
  const debouncedValue = useDebounce(value, debounceMs)
  const initialValueRef = useRef<T | null>(null)
  const isInitializingRef = useRef(true)
  const savingRef = useRef(false)

  // Initialize with first value
  useEffect(() => {
    if (initialValueRef.current === null) {
      initialValueRef.current = value
      // Mark as initialized after a short delay to prevent immediate saves
      setTimeout(() => {
        isInitializingRef.current = false
      }, 100)
    }
  }, [value])

  const hasChanges = useCallback(() => {
    if (!initialValueRef.current) return false
    if (isInitializingRef.current) return false

    if (compareFn) {
      return !compareFn(initialValueRef.current, debouncedValue)
    }

    return JSON.stringify(initialValueRef.current) !== JSON.stringify(debouncedValue)
  }, [debouncedValue, compareFn])

  useEffect(() => {
    if (!enabled) return
    if (!hasChanges()) return
    if (savingRef.current) return

    savingRef.current = true
    onSave(debouncedValue)
      .then(() => {
        initialValueRef.current = debouncedValue
      })
      .catch((error) => {
        console.error('Auto-save error:', error)
      })
      .finally(() => {
        savingRef.current = false
      })
  }, [debouncedValue, enabled, hasChanges, onSave])

  return {
    isSaving: savingRef.current,
  }
}

