import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, UserCheck, UserX, Phone, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { CLASS_LIST } from '@/lib/classes'

interface Teacher {
  id: string
  name: string
  subject: string
  classes: string[]
  phone: string
  email?: string
  status: 'active' | 'on_leave'
}

const BLANK = { name: '', subject: '', phone: '', email: '', classes: [] as string[] }

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  English:     'bg-purple-100 text-purple-700',
  Science:     'bg-green-100 text-green-700',
  Telugu:      'bg-orange-100 text-orange-700',
  Hindi:       'bg-red-100 text-red-700',
  Social:      'bg-yellow-100 text-yellow-700',
  Physics:     'bg-cyan-100 text-cyan-700',
  Chemistry:   'bg-pink-100 text-pink-700',
  Biology:     'bg-lime-100 text-lime-700',
  Computer:    'bg-indigo-100 text-indigo-700',
}

export function TeachersPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin' || user?.role === 'super_admin'

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState(BLANK)
  const [classSearch, setClassSearch] = useState('')

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get('/teachers')
      return res.data ?? []
    },
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (body: typeof BLANK) => api.post('/teachers', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      setModalMode(null)
      setForm(BLANK)
      toast.success('Teacher added')
    },
    onError: () => toast.error('Failed to add teacher'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<typeof BLANK> }) =>
      api.patch(`/teachers/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      setModalMode(null)
      setEditing(null)
      setForm(BLANK)
      toast.success('Teacher updated')
    },
    onError: () => toast.error('Failed to update teacher'),
  })

  const leaveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/teachers/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
    onError: () => toast.error('Failed to update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('Teacher removed')
    },
    onError: () => toast.error('Failed to remove teacher'),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(BLANK)
    setEditing(null)
    setModalMode('add')
  }

  function openEdit(t: Teacher) {
    setForm({ name: t.name, subject: t.subject, phone: t.phone, email: t.email ?? '', classes: t.classes })
    setEditing(t)
    setModalMode('edit')
  }

  function toggleClass(cls: string) {
    setForm((f) => ({
      ...f,
      classes: f.classes.includes(cls)
        ? f.classes.filter((c) => c !== cls)
        : [...f.classes, cls],
    }))
  }

  function handleSave() {
    if (!form.name.trim() || !form.subject.trim()) {
      toast.error('Name and subject are required')
      return
    }
    if (modalMode === 'edit' && editing) {
      editMutation.mutate({ id: editing.id, body: form })
    } else {
      addMutation.mutate(form)
    }
  }

  const filteredClasses = CLASS_LIST.filter((c) =>
    c.toLowerCase().includes(classSearch.toLowerCase()),
  )

  // ── UI ────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-3 text-sm">
        Loading teachers...
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-3">
          {teachers.filter((t) => t.status === 'active').length} active ·{' '}
          {teachers.filter((t) => t.status === 'on_leave').length} on leave
        </p>
        {isAdmin && (
          <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Add Teacher
          </Button>
        )}
      </div>

      {/* Teacher Cards */}
      {teachers.length === 0 ? (
        <Card className="py-16 text-center text-sm text-ink-3">
          No teachers added yet. {isAdmin && 'Click "Add Teacher" to get started.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className={`flex items-start gap-4 ${teacher.status === 'on_leave' ? 'opacity-70' : ''}`}>
                <Avatar name={teacher.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-0">{teacher.name}</p>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                      SUBJECT_COLORS[teacher.subject] ?? 'bg-cream-400 text-ink-2'
                    }`}
                  >
                    {teacher.subject}
                  </span>
                  {teacher.phone && (
                    <p className="text-xs text-ink-3 mt-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {teacher.phone}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.classes.map((c) => (
                      <span key={c} className="text-xs bg-cream-300 text-ink-2 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  <Badge variant={teacher.status === 'active' ? 'green' : 'orange'} dot>
                    {teacher.status === 'active' ? 'Active' : 'On Leave'}
                  </Badge>
                  <div className="flex gap-1">
                    {/* Edit — admin only */}
                    {isAdmin && (
                      <Button
                        variant="ghost" size="icon" title="Edit"
                        onClick={() => openEdit(teacher)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {/* Toggle leave — admin only */}
                    {isAdmin && (
                      <Button
                        variant="ghost" size="sm"
                        leftIcon={
                          teacher.status === 'active'
                            ? <UserX className="h-3.5 w-3.5" />
                            : <UserCheck className="h-3.5 w-3.5" />
                        }
                        onClick={() =>
                          leaveMutation.mutate({
                            id: teacher.id,
                            status: teacher.status === 'active' ? 'on_leave' : 'active',
                          })
                        }
                      >
                        {teacher.status === 'active' ? 'Leave' : 'Return'}
                      </Button>
                    )}
                    {/* Delete — admin only */}
                    {isAdmin && (
                      <Button
                        variant="ghost" size="icon" title="Remove teacher"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => {
                          if (confirm(`Remove ${teacher.name}?`)) deleteMutation.mutate(teacher.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalMode !== null}
        onClose={() => { setModalMode(null); setEditing(null); setForm(BLANK) }}
        title={modalMode === 'edit' ? `Edit — ${editing?.name}` : 'Add Teacher'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Mr. / Ms. Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Subject *"
            placeholder="Mathematics, English, Science…"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            placeholder="teacher@school.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          {/* Class multi-select */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1">
              Classes Assigned
            </label>
            {/* Selected badges */}
            {form.classes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {form.classes.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1 text-xs bg-gold/20 text-ink-1 px-2 py-0.5 rounded-full"
                  >
                    {c}
                    <button onClick={() => toggleClass(c)} className="hover:text-danger">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <Input
              placeholder="Search class… (Nursery, LKG, Class 6A…)"
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
            />
            <div className="mt-2 max-h-40 overflow-y-auto border border-black/8 rounded-lg p-2 grid grid-cols-3 gap-1">
              {filteredClasses.map((c) => {
                const selected = form.classes.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() => toggleClass(c)}
                    className={`text-xs px-2 py-1.5 rounded text-left transition-colors ${
                      selected
                        ? 'bg-gold text-white font-medium'
                        : 'hover:bg-cream-300 text-ink-2'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
              {filteredClasses.length === 0 && (
                <p className="col-span-3 text-xs text-ink-3 py-2 text-center">No classes found</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={() => { setModalMode(null); setEditing(null); setForm(BLANK) }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleSave}
              loading={addMutation.isPending || editMutation.isPending}
              className="flex-1"
            >
              {modalMode === 'edit' ? 'Save Changes' : 'Add Teacher'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
