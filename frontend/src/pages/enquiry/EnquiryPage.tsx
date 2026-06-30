import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/store/ui.store'

type Status = 'new' | 'called' | 'interested' | 'admitted' | 'dropped'
interface Enquiry { id: string; name: string; phone: string; cls: string; source: string; status: Status; date: string }

const DEMO: Enquiry[] = [
  { id: '1', name: 'Vikram Reddy', phone: '9900001111', cls: 'Class 6', source: 'WhatsApp', status: 'interested', date: '2026-05-30' },
  { id: '2', name: 'Ananya Gupta', phone: '9900002222', cls: 'Class 9', source: 'Phone',    status: 'new',        date: '2026-05-31' },
  { id: '3', name: 'Hari Krishna', phone: '9900003333', cls: 'Class 7', source: 'Walk-in',  status: 'admitted',   date: '2026-05-28' },
]

const STATUS_ORDER: Status[] = ['new', 'called', 'interested', 'admitted', 'dropped']
const STATUS_VARIANT: Record<Status, 'gray' | 'blue' | 'gold' | 'green' | 'red'> = {
  new: 'gray', called: 'blue', interested: 'gold', admitted: 'green', dropped: 'red',
}

export function EnquiryPage() {
  const toast = useToast()
  const [enquiries, setEnquiries] = useState<Enquiry[]>(DEMO)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', cls: 'Class 6', source: 'Phone' })

  function advance(id: string) {
    setEnquiries((prev) => prev.map((e) => {
      if (e.id !== id) return e
      const idx = STATUS_ORDER.indexOf(e.status)
      const next = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 2)]
      toast.info('Status updated', `${e.name} → ${next}`)
      return { ...e, status: next }
    }))
  }

  function handleAdd() {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return }
    const e: Enquiry = { id: Date.now().toString(), name: form.name, phone: form.phone, cls: form.cls, source: form.source, status: 'new', date: new Date().toISOString().slice(0, 10) }
    setEnquiries((prev) => [e, ...prev])
    setAddOpen(false)
    setForm({ name: '', phone: '', cls: 'Class 6', source: 'Phone' })
    toast.success('Enquiry added', e.name)
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm text-ink-3">
          {STATUS_ORDER.slice(0, 4).map((s) => (
            <span key={s}><b className="text-ink-0">{enquiries.filter((e) => e.status === s).length}</b> {s}</span>
          ))}
        </div>
        <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Enquiry</Button>
      </div>

      <div className="space-y-2">
        {enquiries.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="flex items-center gap-4">
              <Avatar name={e.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0">{e.name}</p>
                <p className="text-xs text-ink-3">{e.cls} · {e.source} · {e.date}</p>
              </div>
              <Badge variant={STATUS_VARIANT[e.status]}>{e.status.charAt(0).toUpperCase() + e.status.slice(1)}</Badge>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="icon"><Phone className="h-3.5 w-3.5" /></Button>
                {e.status !== 'admitted' && e.status !== 'dropped' && (
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />} onClick={() => advance(e.id)}>Next</Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Enquiry" size="sm">
        <div className="space-y-4">
          <Input label="Parent/Student Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Phone *" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Select label="Class Applying For" options={['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'].map((c) => ({ value: c, label: c }))} value={form.cls} onChange={(e) => setForm((f) => ({ ...f, cls: e.target.value }))} />
          <Select label="Source" options={['Phone','Walk-in','WhatsApp','Online Form'].map((s) => ({ value: s, label: s }))} value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleAdd} className="flex-1">Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
