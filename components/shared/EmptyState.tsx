"use client";

import { ReactNode } from "react";
import { LinkButton } from "@/components/ui";

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
      className="py-12 text-center"
      role="status"
      aria-live="polite"
      aria-label={`${title}. ${description || ""}`}
    >
      <h2 className="text-muted-foreground mb-4 text-lg font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground/70 mb-4 text-sm">{description}</p>}
      {action && (
        <LinkButton href={action.href} aria-label={action.label}>
          {action.label}
        </LinkButton>
      )}
      {children}
    </div>
  );
}
