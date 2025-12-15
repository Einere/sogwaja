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
      className={cn("bg-white border border-border rounded-lg overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}
