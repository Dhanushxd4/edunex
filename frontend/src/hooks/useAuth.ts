import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to the correct home for the role
      if (user.role === 'super_admin') navigate('/admin', { replace: true })
      else if (user.role === 'parent') navigate('/parent', { replace: true })
      else navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, allowedRoles, navigate])

  return { user, isAuthenticated }
}
