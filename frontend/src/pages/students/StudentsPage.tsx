import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Upload, Trash2, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { feeStatusBadge, Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import type { Student } from '@/types'
import { CLASS_FILTER_LIST, CLASS_LIST } from '@/lib/classes'

export function StudentsPage() {
  const { user }    = useAuthStore()
  const toast       = useToast()
  const queryClient = useQueryClient()

  const [search, setSearch]       = useState('')
  const [classFilter, setFilter]  = useState('All')
  const [addOpen, setAddOpen]     = useState(false)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', cls: 'Class 1', roll: '', phone: '', parent: '', parent_email: '' })

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['students', user?.school_id, classFilter, search],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (classFilter !== 'All') params.cls = classFilter
      if (search) params.search = search
      return api.get('/students', { params }).then((r) => r.data)
    },
    enabled: !!user?.school_id,
  })

  const addMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setAddOpen(false)
      setForm({ name: '', cls: 'Class 1', roll: '', phone: '', parent: '', parent_email: '' })
      toast.success('Student added')
    },
    onError: () => toast.error('Failed to add student'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setDeleteId(null)
      toast.success('Student removed')
    },
    onError: () => toast.error('Failed to remove student'),
  })

  function handleAdd() {
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return }
    addMutation.mutate(form)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="w-64">
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-4 w-4" />} />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-btn border border-black/10 bg-white text-xs text-ink-1 font-medium focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            {CLASS_FILTER_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />} onClick={() => window.location.href = '/import'}>Import CSV</Button>
          <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Student</Button>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-ink-3">
        <span><b className="text-ink-0">{students.length}</b> total</span>
        <span><b className="text-danger">{students.filter((s) => s.absent).length}</b> absent today</span>
        <span><b className="text-danger">{students.filter((s) => s.fee_status === 'overdue').length}</b> fee overdue</span>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/8">
                {['Student', 'Class', 'Roll', 'Phone', 'Parent', 'Fee Status', 'Status', ''].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-ink-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-ink-3">
                  No students yet — click Add Student or Import CSV
                </td></tr>
              )}
              {students.map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-black/5 hover:bg-cream-100 transition-colors">
                  <td className="py-3 px-4"><div className="flex items-center gap-2.5"><Avatar name={student.name} size="sm" /><span className="font-medium text-ink-0">{student.name}</span></div></td>
                  <td className="py-3 px-4"><Badge variant="blue">{student.cls}</Badge></td>
                  <td className="py-3 px-4 text-ink-3">{student.roll}</td>
                  <td className="py-3 px-4 text-ink-2 font-mono text-xs">{student.phone}</td>
                  <td className="py-3 px-4 text-ink-2">{student.parent}</td>
                  <td className="py-3 px-4">{feeStatusBadge(student.fee_status)}</td>
                  <td className="py-3 px-4"><Badge variant={student.absent ? 'red' : 'green'} dot>{student.absent ? 'Absent' : 'Present'}</Badge></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Call parent"><Phone className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteId(student.id)} className="text-danger/70 hover:text-danger">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Student" size="md">
        <div className="space-y-4">
          <Input label="Full Name *" placeholder="Student full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-2 mb-1">Class *</label>
              <select
                value={form.cls}
                onChange={(e) => setForm((f) => ({ ...f, cls: e.target.value }))}
                className="w-full px-3 py-2 rounded-btn border border-black/10 bg-white text-sm text-ink-1 focus:outline-none focus:ring-2 focus:ring-gold/50"
              >
                {CLASS_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input label="Roll Number" placeholder="01" value={form.roll} onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))} />
          </div>
          <Input label="Parent Phone *" type="tel" placeholder="9876543210" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Parent Name" placeholder="Parent full name" value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} />
          <Input label="Parent Email" type="email" placeholder="parent@email.com (optional)" value={form.parent_email} onChange={(e) => setForm((f) => ({ ...f, parent_email: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleAdd} loading={addMutation.isPending} className="flex-1">Add Student</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Remove Student" message="Are you sure? This cannot be undone." confirmLabel="Remove" danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
