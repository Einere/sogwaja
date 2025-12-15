import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        primary: "border-primary focus-visible:ring-primary",
        secondary: "border-secondary focus-visible:ring-secondary",
        info: "border-info focus-visible:ring-info",
        warning: "border-warning focus-visible:ring-warning",
        error: "border-error focus-visible:ring-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "variant">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({ label, error, className, id, variant, ref, ...props }: TextareaProps) {
  const textareaId =
    id || (label ? `textarea-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const errorId = error ? `${textareaId}-error` : undefined;
  const textareaVariant = error ? "error" : variant;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        className={cn(textareaVariants({ variant: textareaVariant, className }))}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export { textareaVariants };
