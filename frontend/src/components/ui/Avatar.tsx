import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm:  'h-7 w-7 text-xs',
  md:  'h-9 w-9 text-sm',
  lg:  'h-11 w-11 text-base',
  xl:  'h-14 w-14 text-lg',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center font-semibold text-white shrink-0',
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
