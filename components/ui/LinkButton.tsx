import { AnchorHTMLAttributes, ReactNode, forwardRef } from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const linkButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface LinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof linkButtonVariants> {
  href: string
  children: ReactNode
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, variant, size, className, 'aria-disabled': ariaDisabled, ...props }, ref) => {
    const isDisabled = ariaDisabled === true || ariaDisabled === 'true'
    
    return (
      <Link
        href={isDisabled ? '#' : href}
        ref={ref}
        className={cn(linkButtonVariants({ variant, size, className }))}
        aria-disabled={ariaDisabled}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault()
          }
          props.onClick?.(e)
        }}
        onKeyDown={(e) => {
          if (isDisabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
          }
          props.onKeyDown?.(e)
        }}
        tabIndex={isDisabled ? -1 : undefined}
        {...props}
      >
        {children}
      </Link>
    )
  }
)

LinkButton.displayName = 'LinkButton'

export default LinkButton

