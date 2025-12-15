import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils/index";

const buttonVariantConfig = {
  // shadcn/ui 기본 variant
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary hover:bg-accent/90",

  // 커스텀 variant (CSS 변수 기반)
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  warning: "bg-warning text-warning-foreground hover:bg-warning/90",
  info: "bg-info text-info-foreground hover:bg-info/90",
  error: "bg-error text-error-foreground hover:bg-error/90",
} as const;

export type ButtonVariant = keyof typeof buttonVariantConfig;

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: buttonVariantConfig,
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "variant"> {
  asChild?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: "default" | "sm" | "md" | "lg" | "icon";
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        loading ? "cursor-wait opacity-75" : isDisabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
      ref={ref}
      disabled={isDisabled}
      {...props}
    />
  );
}
