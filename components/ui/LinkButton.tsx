import { AnchorHTMLAttributes, ReactNode, forwardRef } from "react";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

export interface LinkButtonProps
  extends Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "href" | "onClick" | "onKeyDown" | "onMouseDown" | "onMouseUp" | "onTouchStart" | "onTouchEnd"
    >,
    VariantProps<typeof buttonVariants> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      href,
      children,
      variant,
      size,
      className,
      "aria-disabled": ariaDisabled,
      tabIndex,
      prefetch,
      ...props
    },
    ref
  ) => {
    const isDisabled = ariaDisabled === true || ariaDisabled === "true";

    return (
      <Link
        href={isDisabled ? "#" : href}
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        aria-disabled={ariaDisabled}
        tabIndex={isDisabled ? -1 : tabIndex}
        prefetch={isDisabled ? false : prefetch}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

LinkButton.displayName = "LinkButton";

export default LinkButton;
