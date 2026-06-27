import { useState } from 'react'
import { Link2, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'

const TABS = [{ id: 'share', label: 'Share Link' }, { id: 'applications', label: 'Applications' }]

const DEMO_APPS = [
  { id: '1', child: 'Meera Reddy',   parent: 'Ramesh Reddy',   cls: 'Class 7', phone: '9800000011', status: 'pending' as const,   date: '2026-05-31' },
  { id: '2', child: 'Abhiram Kumar', parent: 'Suresh Kumar',   cls: 'Class 9', phone: '9800000012', status: 'reviewed' as const,  date: '2026-05-30' },
  { id: '3', child: 'Sravani Devi',  parent: 'Naresh Babu',   cls: 'Class 6', phone: '9800000013', status: 'admitted' as const,   date: '2026-05-28' },
]

export function AdmissionPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const [tab, setTab] = useState('share')
  const [apps, setApps] = useState(DEMO_APPS)

  const publicUrl = `https://edunex.in/apply/${user?.school_id ?? 'demo'}`
  const whatsappMsg = encodeURIComponent(`🎓 Apply for admission to ${user?.school_name ?? 'our school'}!\n\nClick here: ${publicUrl}`)

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    toast.success('Link copied!')
  }

  function updateStatus(id: string, status: typeof DEMO_APPS[0]['status']) {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    toast.success('Status updated')
  }

  const statusVariant = (s: string) => {
    if (s === 'admitted')  return 'green' as const
    if (s === 'reviewed')  return 'blue'  as const
    if (s === 'rejected')  return 'red'   as const
    return 'gray' as const
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'share' && (
        <Card>
          <h3 className="text-sm font-semibold text-ink-0 mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gold" /> Online Admission Form
          </h3>
          <div className="p-3 bg-cream-300 rounded-btn flex items-center gap-3 mb-4">
            <p className="text-sm font-mono text-ink-2 flex-1 truncate">{publicUrl}</p>
            <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyLink}>Copy</Button>
            <Button variant="gold" size="sm" leftIcon={<ExternalLink className="h-3.5 w-3.5" />} onClick={() => window.open(publicUrl, '_blank')}>Open</Button>
          </div>
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Share on WhatsApp
          </a>
          <p className="text-xs text-ink-3 mt-4">All submissions automatically appear in the Applications tab</p>
        </Card>
      )}

      {tab === 'applications' && (
        <div className="space-y-2">
          <p className="text-sm text-ink-3">{apps.length} applications</p>
          {apps.map((app) => (
            <Card key={app.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0">{app.child}</p>
                <p className="text-xs text-ink-3">{app.cls} · Parent: {app.parent} · {app.phone}</p>
                <p className="text-xs text-ink-3">{app.date}</p>
              </div>
              <Badge variant={statusVariant(app.status)}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</Badge>
              <div className="flex gap-1.5 shrink-0">
                {app.status !== 'admitted' && (
                  <Button variant="success" size="sm" onClick={() => updateStatus(app.id, 'admitted')}>Admit</Button>
                )}
                {app.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => updateStatus(app.id, 'reviewed')}>Review</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
