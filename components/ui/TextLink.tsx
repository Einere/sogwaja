import { AnchorHTMLAttributes, ReactNode, forwardRef } from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textLinkVariants = cva(
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-colors',
  {
    variants: {
      variant: {
        default: 'text-primary hover:underline',
        error: 'text-error hover:underline',
        muted: 'text-muted-foreground hover:underline',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface TextLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof textLinkVariants> {
  href: string
  children: ReactNode
}

const TextLink = forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ href, children, variant, size, className, ...props }, ref) => {
    return (
      <Link
        href={href}
        ref={ref}
        className={cn(textLinkVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Link>
    )
  }
)

TextLink.displayName = 'TextLink'

export default TextLink

