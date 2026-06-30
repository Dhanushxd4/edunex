import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/auth.store'

export function DashboardLayout() {
  const { user } = useAuthStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user?.role ?? 'school_admin'} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
