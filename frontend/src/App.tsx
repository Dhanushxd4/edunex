import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ToastContainer } from '@/components/ui/Toast'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { HelpWidget } from '@/components/ui/HelpWidget'

// Landing
const LandingPage  = lazy(() => import('@/pages/landing/LandingPage').then((m) => ({ default: m.LandingPage })))

// Auth
const LoginPage       = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage    = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ParentLoginPage = lazy(() => import('@/pages/auth/ParentLoginPage').then((m) => ({ default: m.ParentLoginPage })))

// Portals
const DashboardPage    = lazy(() => import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const SuperAdminPage   = lazy(() => import('@/pages/super-admin/SuperAdminPage').then((m) => ({ default: m.SuperAdminPage })))
const ParentPortalPage = lazy(() => import('@/pages/parent/ParentPortalPage').then((m) => ({ default: m.ParentPortalPage })))

// Feature pages (lazy)
const StudentsPage   = lazy(() => import('@/pages/students/StudentsPage').then((m) => ({ default: m.StudentsPage })))
const TeachersPage   = lazy(() => import('@/pages/teachers/TeachersPage').then((m) => ({ default: m.TeachersPage })))
const AttendancePage = lazy(() => import('@/pages/attendance/AttendancePage').then((m) => ({ default: m.AttendancePage })))
const FeesPage       = lazy(() => import('@/pages/fees/FeesPage').then((m) => ({ default: m.FeesPage })))
const BusPage        = lazy(() => import('@/pages/bus/BusPage').then((m) => ({ default: m.BusPage })))
const ExamsPage      = lazy(() => import('@/pages/exams/ExamsPage').then((m) => ({ default: m.ExamsPage })))
const MarksPage      = lazy(() => import('@/pages/marks/MarksPage').then((m) => ({ default: m.MarksPage })))
const AlertsPage     = lazy(() => import('@/pages/alerts/AlertsPage').then((m) => ({ default: m.AlertsPage })))
const AgentPage      = lazy(() => import('@/pages/agent/AgentPage').then((m) => ({ default: m.AgentPage })))
const SettingsPage   = lazy(() => import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const ImportPage     = lazy(() => import('@/pages/import/ImportPage').then((m) => ({ default: m.ImportPage })))
const EnquiryPage    = lazy(() => import('@/pages/enquiry/EnquiryPage').then((m) => ({ default: m.EnquiryPage })))
const AdmissionPage  = lazy(() => import('@/pages/admission/AdmissionPage').then((m) => ({ default: m.AdmissionPage })))
const DemoPage       = lazy(() => import('@/pages/demo/DemoPage').then((m) => ({ default: m.DemoPage })))
const VideoPage      = lazy(() => import('@/pages/video/VideoPage').then((m) => ({ default: m.VideoPage })))
const CoursesPage    = lazy(() => import('@/pages/courses/CoursesPage').then((m) => ({ default: m.CoursesPage })))
const AnalyticsPage  = lazy(() => import('@/pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })))
const BillingPage    = lazy(() => import('@/pages/billing/BillingPage').then((m) => ({ default: m.BillingPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
})

const DEV_BYPASS_AUTH = import.meta.env.DEV

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return (DEV_BYPASS_AUTH || isAuthenticated) ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <>{children}</>
  if (user?.role === 'super_admin') return <Navigate to="/admin" replace />
  if (user?.role === 'parent') return <Navigate to="/parent" replace />
  return <Navigate to="/dashboard" replace />
}

function DevSeedUser() {
  const { user, setUser } = useAuthStore()
  if (DEV_BYPASS_AUTH && !user) {
    setUser(
      { id: 'dev-1', email: 'principal@demo.in', role: 'school_admin', name: 'Dr. K. Rao', school_id: 'school-1', school_name: 'Sri Vidya High School', school_plan: 'professional' },
      'dev-token',
    )
  }
  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DevSeedUser />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/login"         element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register"      element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/parent-login"  element={<PublicRoute><ParentLoginPage /></PublicRoute>} />
            <Route path="/parent"        element={<PrivateRoute><ParentPortalPage /></PrivateRoute>} />
            <Route path="/admin"    element={<PrivateRoute><SuperAdminPage /></PrivateRoute>} />

            <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/students"     element={<StudentsPage />} />
              <Route path="/teachers"     element={<TeachersPage />} />
              <Route path="/attendance"   element={<AttendancePage />} />
              <Route path="/fees"         element={<FeesPage />} />
              <Route path="/bus"          element={<BusPage />} />
              <Route path="/exams"        element={<ExamsPage />} />
              <Route path="/marks"        element={<MarksPage />} />
              <Route path="/alerts"       element={<AlertsPage />} />
              <Route path="/broadcast"    element={<AlertsPage />} />
              <Route path="/agent"        element={<AgentPage />} />
              <Route path="/ivr"          element={<AgentPage />} />
              <Route path="/receptionist" element={<AgentPage />} />
              <Route path="/settings"     element={<SettingsPage />} />
              <Route path="/import"       element={<ImportPage />} />
              <Route path="/enquiries"    element={<EnquiryPage />} />
              <Route path="/admission"    element={<AdmissionPage />} />
              <Route path="/demo"         element={<DemoPage />} />
              <Route path="/video"        element={<VideoPage />} />
              <Route path="/courses"      element={<CoursesPage />} />
              <Route path="/analytics"    element={<AnalyticsPage />} />
              <Route path="/billing"      element={<BillingPage />} />
              <Route path="/achievements" element={<AnalyticsPage />} />
            </Route>

            <Route path="*"  element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
        <HelpWidget />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
