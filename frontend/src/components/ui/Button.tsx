import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'gold' | 'ghost' | 'outline' | 'danger' | 'success' | 'glass'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ink-1 text-cream-50 hover:bg-ink-0 active:scale-[.98]',
  gold:    'bg-gradient-to-r from-gold-dark to-gold text-white hover:shadow-gold active:scale-[.98]',
  ghost:   'bg-transparent text-ink-1 hover:bg-cream-300 active:scale-[.98]',
  outline: 'border border-gold-border text-gold bg-transparent hover:bg-gold-muted active:scale-[.98]',
  danger:  'bg-danger text-white hover:bg-red-600 active:scale-[.98]',
  success: 'bg-success text-white hover:bg-green-700 active:scale-[.98]',
  glass:   'bg-white/10 backdrop-blur-sm border border-white/20 text-ink-1 hover:bg-white/20 active:scale-[.98]',
}

const sizeClasses: Record<Size, string> = {
  sm:   'h-8 px-3 text-xs gap-1.5',
  md:   'h-10 px-4 text-sm gap-2',
  lg:   'h-12 px-6 text-base gap-2.5',
  icon: 'h-9 w-9 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-50 disabled:pointer-events-none select-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon}
      </button>
    )
  },
)

Button.displayName = 'Button'
