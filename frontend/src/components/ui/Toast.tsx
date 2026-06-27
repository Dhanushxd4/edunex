import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui.store'
import type { ToastData } from '@/types'

const icons = {
  success: <CheckCircle className="h-4 w-4 text-success shrink-0" />,
  error:   <XCircle className="h-4 w-4 text-danger shrink-0" />,
  info:    <Info className="h-4 w-4 text-sky-brand shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-gold shrink-0" />,
}

const borderColors = {
  success: 'border-l-success',
  error:   'border-l-danger',
  info:    'border-l-sky-brand',
  warning: 'border-l-gold',
}

function ToastItem({ toast }: { toast: ToastData }) {
  const removeToast = useUiStore((s) => s.removeToast)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex items-start gap-3 min-w-[280px] max-w-sm bg-white border border-black/8 border-l-4 rounded-card shadow-card p-4',
        borderColors[toast.type],
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-1">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs text-ink-3">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-ink-3 hover:text-ink-1 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
