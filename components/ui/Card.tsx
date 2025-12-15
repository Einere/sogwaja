import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function Card({ children, className, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      className={cn("border-border overflow-hidden rounded-lg border bg-white", className)}
      {...props}
    >
      {children}
    </div>
  );
}
