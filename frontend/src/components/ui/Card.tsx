import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export function Card({ children, className, hover, padding = 'md', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card',
        paddingClasses[padding],
        hover && 'card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
}

export function KpiCard({ title, value, subtitle, icon, iconBg = 'bg-gold-muted', trend, className }: KpiCardProps) {
  return (
    <Card className={cn('animate-fadeUp', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-3 uppercase tracking-wide">{title}</p>
          <p className="mt-1 text-2xl font-bold text-ink-0 font-display">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-card', iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
