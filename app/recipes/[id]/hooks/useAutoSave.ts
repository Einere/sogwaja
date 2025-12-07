"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface UseAutoSaveOptions<T> {
  value: T;
  onSave: (value: T) => Promise<void>;
  enabled?: boolean;
  debounceMs?: number;
  compareFn?: (a: T, b: T) => boolean;
}

export function useAutoSave<T>({
  value,
  onSave,
  enabled = true,
  debounceMs = 1000,
  compareFn,
}: UseAutoSaveOptions<T>) {
  const debouncedValue = useDebounce(value, debounceMs);
  const initialValueRef = useRef<T | null>(null);
  const isInitializingRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with first value
  useEffect(() => {
    if (initialValueRef.current === null) {
      initialValueRef.current = value;
      // Mark as initialized after a short delay to prevent immediate saves
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    }
  }, [value]);

  const hasChanges = useCallback(() => {
    if (!initialValueRef.current) return false;
    if (isInitializingRef.current) return false;

    if (compareFn) {
      return !compareFn(initialValueRef.current, debouncedValue);
    }

    return JSON.stringify(initialValueRef.current) !== JSON.stringify(debouncedValue);
  }, [debouncedValue, compareFn]);

  useEffect(() => {
    if (!enabled) return;
    if (!hasChanges()) return;
    if (isSaving) return;

    let cancelled = false;

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      onSave(debouncedValue)
        .then(() => {
          if (!cancelled) {
            initialValueRef.current = debouncedValue;
          }
        })
        .catch(() => {
          if (!cancelled) {
            console.error("Auto-save error");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSaving(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [debouncedValue, enabled, hasChanges, onSave, isSaving]);

  return {
    isSaving,
  };
}
