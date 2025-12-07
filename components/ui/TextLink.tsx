import { AnchorHTMLAttributes, ReactNode, forwardRef } from "react";
import Link from "next/link";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";

export interface TextLinkProps
  extends
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    VariantProps<typeof buttonVariants> {
  href: string;
  children: ReactNode;
}

const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ href, children, variant = "link", size, className, ...props }, ref) => {
    return (
      <Link
        href={href}
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

TextLink.displayName = "TextLink";

export default TextLink;
