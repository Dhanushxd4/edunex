import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building2, Users, DollarSign, Phone, Power, Search } from 'lucide-react'
import { KpiCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, planBadge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { api } from '@/lib/api'
import { useToast } from '@/store/ui.store'

interface School {
  id: string
  name: string
  city?: string
  state?: string
  plan: 'starter' | 'professional' | 'elite'
  student_count?: number
  status: 'active' | 'inactive' | 'trial'
  twilio_number: string | null
  email?: string
  principal?: string
  joined?: string
  created_at?: string
}

export function SuperAdminPage() {
  const [search, setSearch] = useState('')
  const toast = useToast()
  const qc = useQueryClient()

  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ['super-admin-schools'],
    queryFn: async () => {
      const res = await api.get('/admin/schools')
      return res.data.data ?? []
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
    (s.city ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const totalStudents = schools.reduce((a, s) => a + (s.student_count ?? 0), 0)
  const activeSchools = schools.filter((s) => s.status === 'active').length
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
        <p className="text-sm text-ink-3 mt-0.5">All schools · Platform overview</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Schools"   value={schools.length}                        icon={<Building2 className="h-5 w-5 text-gold" />}       iconBg="bg-gold-muted" />
        <KpiCard title="Active Schools"  value={activeSchools}                          icon={<Power className="h-5 w-5 text-success" />}          iconBg="bg-success/10" />
        <KpiCard title="Monthly Revenue" value={`₹${(revenue / 100000).toFixed(1)}L`}  icon={<DollarSign className="h-5 w-5 text-gold" />}       iconBg="bg-gold-muted" />
        <KpiCard title="Total Students"  value={totalStudents.toLocaleString()}         icon={<Users className="h-5 w-5 text-sky-dark" />}         iconBg="bg-sky-brand/10" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-ink-0">Schools</h3>
          <div className="w-64">
            <Input
              placeholder="Search schools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        {schools.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-3">
            No schools registered yet. Schools appear here after they register.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/8">
                  {['School', 'City', 'Plan', 'Students', 'Twilio #', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-ink-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((school) => (
                  <tr key={school.id} className="border-b border-black/5 hover:bg-cream-100 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-medium text-ink-0">{school.name}</p>
                      <p className="text-xs text-ink-3">{school.email}</p>
                    </td>
                    <td className="py-3 px-3 text-ink-2">{school.city}</td>
                    <td className="py-3 px-3">{planBadge(school.plan)}</td>
                    <td className="py-3 px-3 text-ink-2">{(school.student_count ?? 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-ink-3 font-mono text-xs">{school.twilio_number || '—'}</td>
                    <td className="py-3 px-3">
                      <Badge variant={school.status === 'active' ? 'green' : school.status === 'trial' ? 'orange' : 'gray'} dot>
                        {school.status === 'active' ? 'Active' : school.status === 'trial' ? 'Trial' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" leftIcon={<Phone className="h-3 w-3" />}>
                          Assign #
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
                          {school.status === 'active' ? 'Deactivate' : 'Activate'}
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
    </div>
  )
}
