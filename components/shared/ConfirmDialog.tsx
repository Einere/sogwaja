"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "error" | "default";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      // Focus confirm button after a short delay to ensure dialog is rendered
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isOpen) return null;

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
      <p id="dialog-description" className="text-foreground mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <Button onClick={onCancel} variant="secondary" aria-label={cancelLabel}>
          {cancelLabel}
        </Button>
        <Button
          ref={confirmButtonRef}
          onClick={onConfirm}
          variant={variant === "error" ? "error" : "primary"}
          aria-label={confirmLabel}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
