import { cn } from '@/lib/utils'

type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'gray' | 'purple' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  gold:   'bg-gold/10 text-gold-dark border border-gold/20',
  green:  'bg-success/10 text-success border border-success/20',
  red:    'bg-danger/10 text-danger border border-danger/20',
  blue:   'bg-sky-brand/10 text-sky-dark border border-sky-brand/20',
  gray:   'bg-cream-400 text-ink-2 border border-black/10',
  purple: 'bg-purple-100 text-purple-700 border border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border border-orange-200',
}

const dotClasses: Record<BadgeVariant, string> = {
  gold:   'bg-gold',
  green:  'bg-success',
  red:    'bg-danger',
  blue:   'bg-sky-brand',
  gray:   'bg-ink-3',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

export function Badge({ variant = 'gray', dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[variant])} />}
      {children}
    </span>
  )
}

export function feeStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { paid: 'green', pending: 'gold', overdue: 'red' }
  return <Badge variant={map[status] ?? 'gray'} dot>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

export function planBadge(plan: string) {
  const map: Record<string, BadgeVariant> = { starter: 'blue', professional: 'gold', elite: 'purple' }
  return <Badge variant={map[plan] ?? 'gray'}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</Badge>
}
