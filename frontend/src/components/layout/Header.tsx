import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { planBadge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/students':     'Students',
  '/teachers':     'Teachers',
  '/attendance':   'Attendance',
  '/fees':         'Fee Management',
  '/bus':          'Bus Tracking',
  '/exams':        'AI Exam Generator',
  '/marks':        'Marks & Results',
  '/courses':      'Courses (LMS)',
  '/analytics':    'Analytics',
  '/alerts':       'Parent Alerts',
  '/broadcast':    'Broadcast',
  '/demo':         'Demo Call',
  '/agent':        'Auto Agent',
  '/video':        'AI Video',
  '/ivr':          'IVR Responses',
  '/receptionist': 'AI Receptionist',
  '/enquiries':    'Enquiries (CRM)',
  '/admission':    'Online Admission',
  '/import':       'Import Students',
  '/billing':      'Billing',
  '/settings':     'Settings',
  '/achievements': 'Achievements',
}

export function Header() {
  const { user } = useAuthStore()
  const { setSidebarOpen } = useUiStore()
  const { pathname } = useLocation()

  const title = PAGE_TITLES[pathname] ?? 'Edunex'

  return (
    <header className="h-16 bg-cream-100 border-b border-black/8 flex items-center px-5 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-ink-2"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-ink-0 page-title truncate">{title}</h1>
        {user?.school_name && (
          <p className="text-xs text-ink-3 truncate">{user.school_name}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {user?.school_plan && planBadge(user.school_plan)}

        <Button variant="ghost" size="icon" className="relative text-ink-2">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </Button>
      </div>
    </header>
  )
}
