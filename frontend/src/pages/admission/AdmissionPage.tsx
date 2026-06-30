import { useState } from 'react'
import { Link2, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const TABS = [{ id: 'share', label: 'Share Link' }, { id: 'applications', label: 'Applications' }]

interface Enquiry {
  id: string
  name: string
  phone: string
  cls: string
  source: string
  status: 'new' | 'contacted' | 'visited' | 'admitted' | 'rejected'
  created_at: string
}

export function AdmissionPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const qc = useQueryClient()
  const [tab, setTab] = useState('share')

  const schoolId = user?.school_id ?? 'demo'
  const publicUrl = `${window.location.origin}/apply/${schoolId}`
  const whatsappMsg = encodeURIComponent(`🎓 Apply for admission to ${user?.school_name ?? 'our school'}!\n\nClick here: ${publicUrl}`)

  const { data: enquiriesData, isLoading, refetch } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => api.get('/enquiries').then((r) => r.data),
    enabled: tab === 'applications',
  })
  const enquiries: Enquiry[] = Array.isArray(enquiriesData) ? (enquiriesData as Enquiry[]) : []

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/enquiries/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    toast.success('Link copied!')
  }

  const statusVariant = (s: string) => {
    if (s === 'admitted')  return 'green' as const
    if (s === 'contacted') return 'blue'  as const
    if (s === 'visited')   return 'orange' as const
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
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-ink-3">{enquiries.length} enquiries</p>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {isLoading && (
            <Card className="text-center py-8">
              <p className="text-sm text-ink-3 animate-pulse">Loading enquiries…</p>
            </Card>
          )}

          {!isLoading && enquiries.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-sm text-ink-3">No enquiries yet. Share your admission link to start receiving applications.</p>
            </Card>
          )}

          {enquiries.map((app) => (
            <Card key={app.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-0">{app.name}</p>
                <p className="text-xs text-ink-3">
                  {app.cls && `${app.cls} · `}Phone: {app.phone} · Source: {app.source}
                </p>
                <p className="text-xs text-ink-3">
                  {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Badge variant={statusVariant(app.status)}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Badge>
              <div className="flex gap-1.5 shrink-0">
                {app.status !== 'admitted' && (
                  <Button variant="success" size="sm"
                    loading={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'admitted' })}>
                    Admit
                  </Button>
                )}
                {app.status === 'new' && (
                  <Button variant="outline" size="sm"
                    onClick={() => updateStatus.mutate({ id: app.id, status: 'contacted' })}>
                    Contacted
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
