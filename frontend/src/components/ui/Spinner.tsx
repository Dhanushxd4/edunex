import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SpinnerSize, string> = {
  sm:  'h-4 w-4 border-2',
  md:  'h-7 w-7 border-2',
  lg:  'h-10 w-10 border-[3px]',
}

export function Spinner({ size = 'md', className }: { size?: SpinnerSize; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-full border-gold/30 border-t-gold animate-spin',
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
