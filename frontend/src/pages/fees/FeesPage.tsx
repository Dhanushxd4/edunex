import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { DollarSign, Phone, Search, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { feeStatusBadge, Badge } from '@/components/ui/Badge'
import { Card, KpiCard } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'

interface FeeRecord {
  id: string; name: string; cls: string; phone: string
  amount: number; paid: number; due: number
  fee_status: 'paid' | 'pending' | 'overdue'
}

export function FeesPage() {
  const { user }     = useAuthStore()
  const toast        = useToast()
  const queryClient  = useQueryClient()
  const [search, setSearch] = useState('')
  const [calling, setCalling] = useState<string | null>(null)

  const { data: records = [], isLoading } = useQuery<FeeRecord[]>({
    queryKey: ['fees', user?.school_id],
    queryFn:  () => api.get('/fees').then((r) => r.data),
    enabled:  !!user?.school_id,
  })

  const markPaidMutation = useMutation({
    mutationFn: (studentId: string) => api.patch(`/fees/${studentId}/pay`, {}),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['fees'] }); toast.success('Fee marked as paid') },
    onError:    () => toast.error('Failed to update'),
  })

  const filtered = records.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.cls.includes(search)
  )

  const totalCollected = records.reduce((a, r) => a + (r.paid  ?? 0), 0)
  const totalPending   = records.reduce((a, r) => a + (r.due   ?? 0), 0)
  const paidCount      = records.filter((r) => r.fee_status === 'paid').length
  const pct = totalCollected + totalPending > 0
    ? Math.round((totalCollected / (totalCollected + totalPending)) * 100)
    : 0

  async function sendReminder(record: FeeRecord) {
    setCalling(record.id)
    try {
      await api.post('/calls/make', {
        phone:       record.phone,
        type:        'fee',
        studentName: record.name,
      })
      toast.success('Reminder call sent', `Calling ${record.name}'s parent`)
    } catch (err) {
      toast.error('Call failed', err instanceof Error ? err.message : 'Check Twilio credentials')
    } finally {
      setCalling(null)
    }
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Fees"       value={`₹${((totalCollected + totalPending) / 100000).toFixed(1)}L`} icon={<DollarSign className="h-5 w-5 text-gold" />}    iconBg="bg-gold-muted" />
        <KpiCard title="Collected"        value={`₹${(totalCollected / 1000).toFixed(0)}K`}                    icon={<TrendingUp className="h-5 w-5 text-success" />}  iconBg="bg-success/10" />
        <KpiCard title="Pending"          value={`₹${(totalPending / 1000).toFixed(0)}K`}                      icon={<DollarSign className="h-5 w-5 text-gold" />}     iconBg="bg-gold-muted" />
        <KpiCard title="Students Cleared" value={`${paidCount}/${records.length}`}                             icon={<DollarSign className="h-5 w-5 text-sky-dark" />} iconBg="bg-sky-brand/10" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-ink-1">Collection Progress</p>
          <span className="text-sm font-bold text-gold">{pct}%</span>
        </div>
        <div className="h-3 bg-cream-400 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full" />
        </div>
        <div className="flex justify-between text-xs text-ink-3 mt-1">
          <span>₹{(totalCollected / 1000).toFixed(0)}K collected</span>
          <span>₹{(totalPending / 1000).toFixed(0)}K pending</span>
        </div>
      </Card>

      <div className="flex gap-3 items-center justify-between">
        <div className="w-64">
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
        </div>
        <Button variant="gold" size="sm" leftIcon={<Phone className="h-4 w-4" />}
          onClick={() => records.filter((r) => r.fee_status !== 'paid').forEach((r) => sendReminder(r))}>
          Remind All Pending
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8">
                {['Student', 'Class', 'Total', 'Paid', 'Due', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-ink-3">
                  {records.length === 0 ? 'No students yet — add students first' : 'No results'}
                </td></tr>
              )}
              {filtered.map((record, i) => (
                <motion.tr key={record.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-black/5 hover:bg-cream-100 transition-colors">
                  <td className="py-3 px-4"><div className="flex items-center gap-2.5"><Avatar name={record.name} size="sm" /><span className="font-medium text-ink-0">{record.name}</span></div></td>
                  <td className="py-3 px-4"><Badge variant="blue">{record.cls}</Badge></td>
                  <td className="py-3 px-4 text-ink-2">₹{(record.amount ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-success font-medium">₹{(record.paid ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-danger font-medium">₹{(record.due ?? 0).toLocaleString()}</td>
                  <td className="py-3 px-4">{feeStatusBadge(record.fee_status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      {record.fee_status !== 'paid' && (
                        <>
                          <Button variant="success" size="sm" loading={markPaidMutation.isPending} onClick={() => markPaidMutation.mutate(record.id)}>Mark Paid</Button>
                          <Button variant="outline" size="sm" loading={calling === record.id} leftIcon={<Phone className="h-3.5 w-3.5" />} onClick={() => sendReminder(record)}>Remind</Button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
