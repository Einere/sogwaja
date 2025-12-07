"use client";

import { ReactNode } from "react";
import LinkButton from "@/components/ui/LinkButton";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
}

export default function EmptyState({ title, description, action, children }: EmptyStateProps) {
  return (
    <div
      className="text-center py-12"
      role="status"
      aria-live="polite"
      aria-label={`${title}. ${description || ""}`}
    >
      <p className="text-muted-foreground mb-4">{title}</p>
      {description && <p className="text-sm text-muted-foreground/70 mb-4">{description}</p>}
      {action && (
        <LinkButton href={action.href} aria-label={action.label}>
          {action.label}
        </LinkButton>
      )}
      {children}
    </div>
  );
}
