import { forwardRef, type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const cardVariants = cva('rounded-xl overflow-hidden transition-all duration-300', {
  variants: {
    variant: {
      default: 'bg-neutral-0 border border-neutral-200 shadow-md',
      elevated: 'bg-neutral-0 shadow-xl',
      ghost: 'bg-transparent',
      glass: 'bg-white/10 backdrop-blur-lg border border-white/20',
    },
    interactive: {
      true: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
})

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, interactive, padding }), className)}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-semibold text-neutral-900', className)}
    {...props}
  />
))

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-neutral-500', className)} {...props} />
))

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
)

CardFooter.displayName = 'CardFooter'
