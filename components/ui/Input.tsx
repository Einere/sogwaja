import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "variant">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({ label, error, className, id, variant, ref, ...props }: InputProps) {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const errorId = error ? `${inputId}-error` : undefined;
  const inputVariant = error ? "error" : variant;

  if (label || error) {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(inputVariants({ variant: inputVariant, className }))}
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

  return (
    <input
      ref={ref}
      className={cn(inputVariants({ variant: inputVariant, className }))}
      {...props}
    />
  );
}

export { inputVariants };
