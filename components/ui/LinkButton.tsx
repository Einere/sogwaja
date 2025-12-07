import { AnchorHTMLAttributes, ReactNode, forwardRef } from "react";
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
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, variant, size, className, "aria-disabled": ariaDisabled, ...props }, ref) => {
    const isDisabled = ariaDisabled === true || ariaDisabled === "true";

    return (
      <Link
        href={isDisabled ? "#" : href}
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        aria-disabled={ariaDisabled}
        onClick={e => {
          if (isDisabled) {
            e.preventDefault();
          }
          props.onClick?.(e);
        }}
        onKeyDown={e => {
          if (isDisabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
          }
          props.onKeyDown?.(e);
        }}
        tabIndex={isDisabled ? -1 : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LinkButton.displayName = "LinkButton";

export default LinkButton;
