import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import type { AuthUser } from '@/types'

interface RegisterResponse { user: AuthUser; token: string }

interface StepData {
  // Step 1 — School Info
  schoolName: string
  schoolType: string
  board: string
  city: string
  state: string
  email: string
  phone: string
  // Step 2 — Login Setup
  principalName: string
  password: string
  confirmPassword: string
  // Step 3 — Infrastructure
  studentCount: string
  medium: string
  // Step 4 — Plan
  plan: 'starter' | 'professional' | 'elite'
}

const INITIAL: StepData = {
  schoolName: '', schoolType: 'private', board: 'CBSE', city: '', state: 'Telangana', email: '', phone: '',
  principalName: '', password: '', confirmPassword: '',
  studentCount: '500', medium: 'English',
  plan: 'starter',
}

const PLANS = [
  { id: 'starter',      label: 'Starter',      price: '₹25,000', students: 'Up to 500 students',   color: 'border-sky-brand' },
  { id: 'professional', label: 'Professional', price: '₹75,000', students: 'Up to 2,000 students',  color: 'border-gold' },
  { id: 'elite',        label: 'Elite',        price: '₹1,00,000', students: 'Unlimited students', color: 'border-purple-400' },
]

const STEPS = ['School Info', 'Login Setup', 'Infrastructure', 'Select Plan']

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const toast = useToast()

  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof StepData, string>>>({})
  const [loading, setLoading] = useState(false)

  function set(field: keyof StepData, value: string) {
    setData((d) => ({ ...d, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validateStep(): boolean {
    const e: typeof errors = {}
    if (step === 0) {
      if (!data.schoolName.trim()) e.schoolName = 'School name is required'
      if (!data.city.trim()) e.city = 'City is required'
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) e.email = 'Valid email required'
      if (!data.phone.trim() || data.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit phone required'
    }
    if (step === 1) {
      if (!data.principalName.trim()) e.principalName = 'Name is required'
      if (data.password.length < 8) e.password = 'Minimum 8 characters'
      if (data.password !== data.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextStep() {
    if (validateStep()) setStep((s) => s + 1)
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const { data: res } = await api.post<RegisterResponse>('/auth/register', data)
      setUser(res.user, res.token)
      toast.success('School registered!', 'Welcome to Edunex')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Registration failed', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const boardOptions = [
    { value: 'CBSE', label: 'CBSE' },
    { value: 'ICSE', label: 'ICSE' },
    { value: 'State Board', label: 'State Board (AP/TS)' },
    { value: 'IB', label: 'IB' },
  ]
  const stateOptions = [
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Other', label: 'Other' },
  ]
  const mediumOptions = [
    { value: 'English', label: 'English Medium' },
    { value: 'Telugu', label: 'Telugu Medium' },
    { value: 'Hindi', label: 'Hindi Medium' },
    { value: 'Bilingual', label: 'Bilingual' },
  ]

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
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-9 w-9 rounded-card bg-gradient-to-br from-gold-dark to-gold shadow-gold">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold">
            <span className="edunex-logo-edu">Edu</span>
            <span className="edunex-logo-nex">nex</span>
          </span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold shrink-0 transition-all ${
                i < step ? 'bg-success text-white' :
                i === step ? 'bg-gold text-white' :
                'bg-cream-400 text-ink-3'
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${i < step ? 'bg-success' : 'bg-cream-400'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-ink-0 mb-1">{STEPS[step]}</h2>
          <p className="text-sm text-ink-3 mb-5">Step {step + 1} of {STEPS.length}</p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Input label="School Name" placeholder="Sri Vidya High School" value={data.schoolName} onChange={(e) => set('schoolName', e.target.value)} error={errors.schoolName} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Board" options={boardOptions} value={data.board} onChange={(e) => set('board', e.target.value)} />
                  <Select label="State" options={stateOptions} value={data.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <Input label="City" placeholder="Hyderabad" value={data.city} onChange={(e) => set('city', e.target.value)} error={errors.city} />
                <Input label="School Email" type="email" placeholder="info@school.edu" value={data.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
                <Input label="Phone Number" type="tel" placeholder="9876543210" value={data.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Input label="Principal Name" placeholder="Dr. K. Rao" value={data.principalName} onChange={(e) => set('principalName', e.target.value)} error={errors.principalName} />
                <Input label="Password" type="password" placeholder="Minimum 8 characters" value={data.password} onChange={(e) => set('password', e.target.value)} error={errors.password} />
                <Input label="Confirm Password" type="password" placeholder="Re-enter password" value={data.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} error={errors.confirmPassword} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Select label="Medium of Instruction" options={mediumOptions} value={data.medium} onChange={(e) => set('medium', e.target.value)} />
                <div>
                  <label className="text-sm font-medium text-ink-2">Approximate Student Count</label>
                  <input
                    type="range" min="100" max="3000" step="100"
                    value={data.studentCount}
                    onChange={(e) => set('studentCount', e.target.value)}
                    className="w-full mt-2 accent-gold"
                  />
                  <div className="flex justify-between text-xs text-ink-3 mt-1">
                    <span>100</span>
                    <span className="text-gold font-semibold">{parseInt(data.studentCount).toLocaleString()} students</span>
                    <span>3,000</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => set('plan', plan.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-card border-2 transition-all text-left ${
                      data.plan === plan.id ? `${plan.color} bg-white shadow-card` : 'border-black/8 bg-cream-100 hover:border-black/15'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-ink-0">{plan.label}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{plan.students}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink-0">{plan.price}</p>
                      <p className="text-xs text-ink-3">/month</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button variant="gold" className="flex-1" onClick={nextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            ) : (
              <Button variant="gold" className="flex-1" onClick={handleSubmit} loading={loading} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Create School
              </Button>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-ink-3">
            Already registered?{' '}
            <Link to="/login" className="text-gold font-medium hover:text-gold-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
