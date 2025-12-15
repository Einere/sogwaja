import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariantConfig = {
  default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  // 멘션 태그용 variants
  equipment: "bg-info/30 text-foreground",
  ingredient: "bg-warning/30 text-warning-foreground",
  // 상태 표시용 variants
  warning: "bg-warning/30 text-warning-foreground",
  info: "bg-info/30 text-foreground",
  error: "bg-error/30 text-error-foreground",
} as const;

export type BadgeVariant = keyof typeof badgeVariantConfig;

const badgeVariants = cva(
  "inline-flex items-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: badgeVariantConfig,
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "variant"> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  ref?: React.Ref<HTMLSpanElement>;
}

export function Badge({ className, variant, size, children, ref, ...props }: BadgeProps) {
  return (
    <span ref={ref} className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {children}
    </span>
  );
}

export { badgeVariants };
