import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 bg-cream-300 rounded-btn p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all duration-150',
            activeTab === tab.id
              ? 'bg-white text-ink-1 shadow-card'
              : 'text-ink-3 hover:text-ink-2',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold',
              activeTab === tab.id ? 'bg-gold text-white' : 'bg-cream-400 text-ink-3',
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
