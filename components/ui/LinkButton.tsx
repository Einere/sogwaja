import { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

export interface LinkButtonProps
  extends
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    VariantProps<typeof buttonVariants> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
  ref?: React.Ref<HTMLAnchorElement>;
}

export function LinkButton({
  href,
  children,
  variant,
  size,
  className,
  prefetch,
  ref,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
