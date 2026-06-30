import { create } from 'zustand'
import type { ToastData } from '@/types'

interface UiState {
  sidebarOpen: boolean
  toasts: ToastData[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toasts: [],

  toggleSidebar() {
    set((s) => ({ sidebarOpen: !s.sidebarOpen }))
  },

  setSidebarOpen(open) {
    set({ sidebarOpen: open })
  },

  addToast(toast) {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3500)
  },

  removeToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

// Convenience hook for triggering toasts anywhere
export function useToast() {
  const addToast = useUiStore((s) => s.addToast)
  return {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error:   (title: string, message?: string) => addToast({ type: 'error',   title, message }),
    info:    (title: string, message?: string) => addToast({ type: 'info',    title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
  }
}
