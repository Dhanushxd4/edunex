import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Sparkles, Phone, ArrowRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import type { AuthUser } from '@/types'

interface LoginResponse { user: AuthUser; token: string }

type Mode = 'login' | 'register'

export function ParentLoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Login fields
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Register extra fields
  const [name, setName] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !password) { toast.error('All fields required'); return }
    setLoading(true)
    try {
      const { data } = await api.post<LoginResponse>('/parents/login', { phone, password })
      setUser(data.user, data.token)
      navigate('/parent')
    } catch {
      toast.error('Login failed', 'Invalid phone number or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !password || !name || !schoolCode) { toast.error('Fill all required fields'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await api.post<LoginResponse>('/parents/register', {
        phone, password, name, schoolCode, studentName: studentName || undefined,
      })
      setUser(data.user, data.token)
      navigate('/parent')
    } catch (err) {
      toast.error('Registration failed', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
          <p className="mt-1 text-sm text-ink-3">Parent Portal</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-card border border-black/8 shadow-card p-6">
          {/* Mode toggle */}
          <div className="flex rounded-btn border border-black/8 p-1 mb-5 gap-1">
            <button
              className={`flex-1 text-sm font-medium py-1.5 rounded transition-all ${mode === 'login' ? 'bg-ink-0 text-white' : 'text-ink-3 hover:text-ink-1'}`}
              onClick={() => setMode('login')}>
              Sign In
            </button>
            <button
              className={`flex-1 text-sm font-medium py-1.5 rounded transition-all ${mode === 'register' ? 'bg-ink-0 text-white' : 'text-ink-3 hover:text-ink-1'}`}
              onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-4" />
                  <Input
                    type="tel"
                    placeholder="Your registered phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pr-9"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Your Name *</label>
                <Input placeholder="e.g. Ramesh Kumar" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">School Code *</label>
                <Input placeholder="Ask school for their code / email prefix" value={schoolCode} onChange={e => setSchoolCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">
                  <Phone className="inline h-3 w-3 mr-1" />Phone Number *
                </label>
                <Input type="tel" placeholder="Your phone (used to login)" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Child's Name (optional)</label>
                <Input placeholder="Auto-links your child's profile" value={studentName} onChange={e => setStudentName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Password *</label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="pr-9" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4" onClick={() => setShowPassword(s => !s)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1.5">Confirm Password *</label>
                <Input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" loading={loading} leftIcon={<UserPlus className="h-4 w-4" />}>
                Create Parent Account
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-ink-3 mt-5">
            School staff?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">School Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
