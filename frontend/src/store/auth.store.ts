import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser, token: string) => void
  clearAuth: () => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser(user, token) {
        localStorage.setItem('edunex_token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth() {
        localStorage.removeItem('edunex_token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      async logout() {
        await supabase.auth.signOut()
        localStorage.removeItem('edunex_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'edunex_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
