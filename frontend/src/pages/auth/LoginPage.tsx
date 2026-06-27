import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import type { AuthUser } from '@/types'

interface LoginResponse {
  user: AuthUser
  token: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
      setUser(data.user, data.token)

      const role = data.user.role
      if (role === 'super_admin') navigate('/admin')
      else if (role === 'parent') navigate('/parent')
      else navigate('/dashboard')
    } catch (err) {
      toast.error('Login failed', err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-sky-brand/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-card bg-gradient-to-br from-gold-dark to-gold shadow-gold mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-ink-0">
            <span className="edunex-logo-edu">Edu</span>
            <span className="edunex-logo-nex">nex</span>
          </h1>
          <p className="mt-1 text-sm text-ink-3">AI-Powered School Management</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-ink-0 mb-1">Welcome back</h2>
          <p className="text-sm text-ink-3 mb-5">Sign in to your school dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="principal@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="hover:text-ink-1 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="gold"
              className="w-full"
              loading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-black/8 space-y-2 text-center">
            <p className="text-sm text-ink-3">
              New school?{' '}
              <Link to="/register" className="text-gold font-medium hover:text-gold-dark transition-colors">
                Register here
              </Link>
            </p>
            <p className="text-sm text-ink-3">
              Are you a parent?{' '}
              <Link to="/parent-login" className="text-primary font-medium hover:underline transition-colors">
                Parent Login
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-gold-muted border border-gold-border rounded-btn">
          <p className="text-xs text-ink-2 text-center">
            <span className="font-medium text-gold-dark">Super Admin:</span>{' '}
            superadmin@edunex.in
          </p>
        </div>
      </motion.div>
    </div>
  )
}
