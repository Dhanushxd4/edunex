import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building2, Users, DollarSign, Phone, Power, Search,
  Plus, Globe, Palette, Shield, Edit3,
  CheckCircle, Trash2, PhoneCall
} from 'lucide-react'
import { KpiCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, planBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { api } from '@/lib/api'
import { useToast } from '@/store/ui.store'

interface Branding {
  logo_url?: string
  primary_color?: string
  school_display_name?: string
  hide_vendor_names?: boolean
}

interface School {
  id: string
  name: string
  city?: string
  state?: string
  plan: 'starter' | 'professional' | 'elite'
  student_count?: number
  status: 'active' | 'inactive' | 'trial'
  twilio_number: string | null
  phone_numbers?: string[]
  branding?: Branding
  plan_expires?: string | null
  email?: string
  principal?: string
  created_at?: string
}

const PLANS = [
  { value: 'starter', label: 'Starter', price: '₹25,000/mo' },
  { value: 'professional', label: 'Professional', price: '₹75,000/mo' },
  { value: 'elite', label: 'Elite', price: '₹1,00,000/mo' },
]

function SchoolModal({ school, onClose }: { school: School; onClose: () => void }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [tab, setTab] = useState<'numbers' | 'plan' | 'branding'>('numbers')
  const [newNumber, setNewNumber] = useState('')
  const [numbers, setNumbers] = useState<string[]>(school.phone_numbers || [])
  const [plan, setPlan] = useState(school.plan)
  const [status, setStatus] = useState(school.status)
  const [branding, setBranding] = useState<Branding>(school.branding || {})
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      // Save settings (phone_numbers + branding)
      await api.put(`/admin/schools/${school.id}/settings`, {
        phone_numbers: numbers,
        branding,
      })
      // Save plan + status
      await api.patch(`/admin/schools/${school.id}`, { plan, status })
      qc.invalidateQueries({ queryKey: ['super-admin-schools'] })
      toast.success('School updated')
      onClose()
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function addNumber() {
    const n = newNumber.trim()
    if (!n) return
    if (numbers.includes(n)) { toast.error('Number already added'); return }
    setNumbers([...numbers, n])
    setNewNumber('')
  }

  return (
    <Modal open onClose={onClose} title={school.name} size="lg">
      <div className="space-y-5">
        {/* School info strip */}
        <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-xl text-sm text-ink-2">
          <Building2 className="h-4 w-4 text-gold flex-shrink-0" />
          <span>{school.email}</span>
          {school.city && <><span className="text-ink-4">·</span><span>{school.city}</span></>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-100 p-1 rounded-xl">
          {[
            { id: 'numbers', label: 'Phone Numbers', icon: <Phone className="h-3.5 w-3.5" /> },
            { id: 'plan', label: 'Plan & Status', icon: <Shield className="h-3.5 w-3.5" /> },
            { id: 'branding', label: 'Branding', icon: <Palette className="h-3.5 w-3.5" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-white text-ink-0 shadow-sm'
                  : 'text-ink-3 hover:text-ink-1'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Phone Numbers */}
        {tab === 'numbers' && (
          <div className="space-y-3">
            <p className="text-xs text-ink-3">Assign Twilio numbers to this school. The first number is the primary (used for voice calls).</p>
            <div className="flex gap-2">
              <Input
                placeholder="+1 234 567 8900"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNumber()}
                leftIcon={<Phone className="h-4 w-4" />}
              />
              <Button variant="primary" size="sm" onClick={addNumber} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                Add
              </Button>
            </div>
            {numbers.length === 0 ? (
              <p className="text-center text-xs text-ink-3 py-6">No numbers assigned yet</p>
            ) : (
              <div className="space-y-2">
                {numbers.map((num, i) => (
                  <div key={num} className="flex items-center gap-3 p-3 bg-cream-100 rounded-xl">
                    <PhoneCall className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="flex-1 font-mono text-sm text-ink-1">{num}</span>
                    {i === 0 && (
                      <Badge variant="green" dot className="text-xs">Primary</Badge>
                    )}
                    <button
                      onClick={() => setNumbers(numbers.filter((_, idx) => idx !== i))}
                      className="text-ink-4 hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Plan & Status */}
        {tab === 'plan' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2 block">Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlan(p.value as School['plan'])}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      plan === p.value
                        ? 'border-gold bg-gold/5'
                        : 'border-black/8 hover:border-gold/30'
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink-0">{p.label}</p>
                    <p className="text-xs text-ink-3 mt-0.5">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-2 block">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['active', 'trial', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      status === s
                        ? s === 'active' ? 'border-success bg-success/5'
                          : s === 'trial' ? 'border-amber-400 bg-amber-400/5'
                          : 'border-danger bg-danger/5'
                        : 'border-black/8 hover:border-black/20'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                      s === 'active' ? 'bg-success' : s === 'trial' ? 'bg-amber-400' : 'bg-ink-4'
                    }`} />
                    <p className="text-xs font-semibold text-ink-0 capitalize">{s}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Branding */}
        {tab === 'branding' && (
          <div className="space-y-4">
            <p className="text-xs text-ink-3">White-label this school — hide Edunex branding and use their own identity.</p>

            {/* Hide vendor names toggle */}
            <div className="flex items-center justify-between p-3 bg-cream-100 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-ink-0">Hide Third-Party Names</p>
                <p className="text-xs text-ink-3 mt-0.5">Hide "Gemini", "Twilio", "D-ID" from school users</p>
              </div>
              <button
                onClick={() => setBranding({ ...branding, hide_vendor_names: !branding.hide_vendor_names })}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  branding.hide_vendor_names ? 'bg-gold' : 'bg-ink-5'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                  branding.hide_vendor_names ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-1 block">School Display Name</label>
              <Input
                placeholder={school.name}
                value={branding.school_display_name || ''}
                onChange={(e) => setBranding({ ...branding, school_display_name: e.target.value })}
              />
              <p className="text-xs text-ink-4 mt-1">Shown instead of the registered name in the app</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-1 block">Logo URL</label>
              <Input
                placeholder="https://school.com/logo.png"
                value={branding.logo_url || ''}
                onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                leftIcon={<Globe className="h-4 w-4" />}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-3 uppercase tracking-wide mb-1 block">Brand Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={branding.primary_color || '#C9A84C'}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-black/10 cursor-pointer p-0.5 bg-white"
                />
                <Input
                  placeholder="#C9A84C"
                  value={branding.primary_color || ''}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                />
              </div>
            </div>

            {/* Preview */}
            {branding.hide_vendor_names && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <strong>Vendor names hidden:</strong> School users won't see "Gemini AI", "Twilio", or "D-ID" anywhere in the app. They'll see generic labels like "AI Assistant" and "Voice System" instead.
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-black/8">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" size="sm" onClick={save} loading={saving} className="flex-1"
            leftIcon={<CheckCircle className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function SuperAdminPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<School | null>(null)
  const toast = useToast()
  const qc = useQueryClient()

  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['super-admin-schools'],
    queryFn: async () => {
      const res = await api.get('/admin/schools')
      return res.data ?? []
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/schools/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-schools'] })
      toast.success('School status updated')
    },
    onError: () => toast.error('Failed to update school'),
  })

  const filtered = schools.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const totalStudents = schools.reduce((a, s) => a + (s.student_count ?? 0), 0)
  const activeSchools = schools.filter((s) => s.status === 'active').length
  const trialSchools = schools.filter((s) => s.status === 'trial').length
  const revenue = schools
    .filter((s) => s.status === 'active')
    .reduce((a, s) => a + (s.plan === 'elite' ? 100000 : s.plan === 'professional' ? 75000 : 25000), 0)

  if (isLoading) return <PageLoader />

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-ink-0 page-title">
          <span className="edunex-logo-edu">Edu</span>
          <span className="edunex-logo-nex">nex</span>
          {' '}Super Admin
        </h1>
        <p className="text-sm text-ink-3 mt-0.5">All schools · Platform control · White-label management</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Schools"   value={schools.length}                        icon={<Building2 className="h-5 w-5 text-gold" />}     iconBg="bg-gold-muted" />
        <KpiCard title="Active Schools"  value={activeSchools}                          icon={<Power className="h-5 w-5 text-success" />}        iconBg="bg-success/10" />
        <KpiCard title="Monthly Revenue" value={`₹${(revenue / 100000).toFixed(1)}L`}  icon={<DollarSign className="h-5 w-5 text-gold" />}     iconBg="bg-gold-muted" />
        <KpiCard title="Total Students"  value={totalStudents.toLocaleString()}         icon={<Users className="h-5 w-5 text-sky-dark" />}       iconBg="bg-sky-brand/10" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink-0">Schools</h3>
            <p className="text-xs text-ink-3 mt-0.5">{activeSchools} active · {trialSchools} trial · {schools.length - activeSchools - trialSchools} inactive</p>
          </div>
          <div className="w-64">
            <Input
              placeholder="Search by name, city, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        {schools.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-3">
            No schools registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  {['School', 'City', 'Plan', 'Numbers', 'Status', 'Branding', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-ink-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((school) => (
                  <tr key={school.id} className="border-b border-black/5 hover:bg-cream-100 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-ink-0">{school.branding?.school_display_name || school.name}</p>
                      <p className="text-xs text-ink-3">{school.email}</p>
                    </td>
                    <td className="py-3 px-3 text-ink-2">{school.city || '—'}</td>
                    <td className="py-3 px-3">{planBadge(school.plan)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-ink-3" />
                        <span className="text-xs font-mono text-ink-2">
                          {(school.phone_numbers?.length ?? 0) > 0
                            ? `${school.phone_numbers![0].slice(-4)}… (${school.phone_numbers!.length})`
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={school.status === 'active' ? 'green' : school.status === 'trial' ? 'orange' : 'gray'} dot>
                        {school.status === 'active' ? 'Active' : school.status === 'trial' ? 'Trial' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {school.branding?.hide_vendor_names ? (
                        <Badge variant="blue">White-label</Badge>
                      ) : (
                        <span className="text-xs text-ink-4">Default</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit3 className="h-3 w-3" />}
                          onClick={() => setSelected(school)}
                        >
                          Manage
                        </Button>
                        <Button
                          variant={school.status === 'active' ? 'danger' : 'success'}
                          size="sm"
                          loading={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: school.id,
                              status: school.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                        >
                          {school.status === 'active' ? 'Stop' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <SchoolModal school={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
