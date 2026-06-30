import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck,
  DollarSign, Bus, FileText, BarChart2, Bell, Upload,
  Bot, Video, Phone, PhoneIncoming, ClipboardList,
  FileInput, MessageSquare, Settings, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Sparkles,
  TrendingUp, Award, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { useUiStore } from '@/store/ui.store'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: string[]
  badge?: number
  section?: string
}

const NAV_ITEMS: NavItem[] = [
  // School Management
  { label: 'Dashboard',    path: '/dashboard',    icon: <LayoutDashboard className="h-4 w-4" />, roles: ['school_admin'], section: 'School' },
  { label: 'Students',     path: '/students',     icon: <Users className="h-4 w-4" />,           roles: ['school_admin'] },
  { label: 'Teachers',     path: '/teachers',     icon: <UserCheck className="h-4 w-4" />,       roles: ['school_admin'] },
  { label: 'Attendance',   path: '/attendance',   icon: <UserCheck className="h-4 w-4" />,       roles: ['school_admin'] },
  { label: 'Fees',         path: '/fees',         icon: <DollarSign className="h-4 w-4" />,      roles: ['school_admin'] },
  { label: 'Bus Tracking', path: '/bus',          icon: <Bus className="h-4 w-4" />,             roles: ['school_admin'] },
  // AI & Exams
  { label: 'AI Exams',     path: '/exams',        icon: <FileText className="h-4 w-4" />,        roles: ['school_admin'], section: 'AI & Learning' },
  { label: 'Marks',        path: '/marks',        icon: <BarChart2 className="h-4 w-4" />,       roles: ['school_admin'] },
  { label: 'Courses (LMS)',path: '/courses',      icon: <BookMarked className="h-4 w-4" />,      roles: ['school_admin'] },
  { label: 'Analytics',    path: '/analytics',    icon: <TrendingUp className="h-4 w-4" />,      roles: ['school_admin'] },
  // Communication
  { label: 'Alerts',       path: '/alerts',       icon: <Bell className="h-4 w-4" />,            roles: ['school_admin'], section: 'Communication' },
  { label: 'Broadcast',    path: '/broadcast',    icon: <MessageSquare className="h-4 w-4" />,   roles: ['school_admin'] },
  { label: 'Demo Call',    path: '/demo',         icon: <Phone className="h-4 w-4" />,           roles: ['school_admin'] },
  // Automation
  { label: 'Auto Agent',   path: '/agent',        icon: <Bot className="h-4 w-4" />,             roles: ['school_admin'], section: 'Automation' },
  { label: 'AI Video',     path: '/video',        icon: <Video className="h-4 w-4" />,           roles: ['school_admin'] },
  { label: 'IVR Responses',path: '/ivr',          icon: <PhoneIncoming className="h-4 w-4" />,  roles: ['school_admin'] },
  { label: 'Receptionist', path: '/receptionist', icon: <PhoneIncoming className="h-4 w-4" />,  roles: ['school_admin'] },
  // Admissions
  { label: 'Enquiries',    path: '/enquiries',    icon: <ClipboardList className="h-4 w-4" />,  roles: ['school_admin'], section: 'Admissions' },
  { label: 'Admission Form',path: '/admission',   icon: <FileInput className="h-4 w-4" />,      roles: ['school_admin'] },
  { label: 'Import Data',  path: '/import',       icon: <Upload className="h-4 w-4" />,         roles: ['school_admin'] },
  // Account
  { label: 'Billing',      path: '/billing',      icon: <CreditCard className="h-4 w-4" />,     roles: ['school_admin'], section: 'Account' },
  { label: 'Settings',     path: '/settings',     icon: <Settings className="h-4 w-4" />,       roles: ['school_admin'] },
  // Gamification
  { label: 'Achievements', path: '/achievements', icon: <Award className="h-4 w-4" />,          roles: ['school_admin'], section: 'Students' },
]

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  // Group items by section
  const sections: Record<string, NavItem[]> = {}
  let currentSection = ''
  for (const item of filteredItems) {
    if (item.section) currentSection = item.section
    if (!sections[currentSection]) sections[currentSection] = []
    sections[currentSection].push(item)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-full bg-surface-2 border-r border-black/8 shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-black/8 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center h-8 w-8 rounded-btn bg-gradient-to-br from-gold-dark to-gold shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="edunex-logo-edu text-lg">Edu</span>
                <span className="edunex-logo-nex text-lg">nex</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={toggleSidebar}
          className="ml-auto shrink-0 text-ink-3 hover:text-ink-1 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-1">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-3"
                >
                  {section}
                </motion.p>
              )}
            </AnimatePresence>
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-2 py-2 rounded-btn text-sm font-medium transition-all duration-150 mb-0.5',
                    isActive
                      ? 'bg-gold-muted text-gold-dark border-l-2 border-gold pl-[6px]'
                      : 'text-ink-2 hover:bg-cream-300 hover:text-ink-1',
                    !sidebarOpen && 'justify-center px-0',
                  )
                }
                title={!sidebarOpen ? item.label : undefined}
              >
                {item.icon}
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-black/8 p-3 shrink-0">
        <div className={cn('flex items-center gap-2.5', !sidebarOpen && 'justify-center')}>
          <Avatar name={user?.name ?? 'User'} size="sm" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p className="text-xs font-medium text-ink-1 truncate">{user?.name}</p>
                <p className="text-[10px] text-ink-3 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0 text-ink-3 hover:text-danger"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.aside>
  )
}
