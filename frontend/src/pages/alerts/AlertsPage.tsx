import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'

const TEMPLATES = [
  { id: 'holiday',  label: 'Holiday Notice', en: 'Dear Parent, school will remain closed on {date} due to {reason}. Classes resume on {next_date}.', te: 'ప్రియమైన తల్లిదండ్రులకు, పాఠశాల {date} న {reason} కారణంగా మూసివేయబడుతుంది.' },
  { id: 'ptm',      label: 'Parent-Teacher Meeting', en: 'Dear Parent, PTM is scheduled on {date} from {time}. Your presence is important.', te: 'ప్రియమైన తల్లిదండ్రులకు, {date} న PTM నిర్వహించబడుతుంది.' },
  { id: 'exam',     label: 'Exam Schedule', en: 'Dear Parent, exams begin on {date}. Please ensure {studentName} prepares well.', te: 'ప్రియమైన తల్లిదండ్రులకు, పరీక్షలు {date} నుండి మొదలవుతాయి.' },
  { id: 'fee',      label: 'Fee Reminder', en: 'Dear Parent, fee for this term is due on {date}. Please pay at the earliest.', te: 'ప్రియమైన తల్లిదండ్రులకు, ఈ టర్మ్ ఫీజు {date} నాటికి చెల్లించాలి.' },
  { id: 'annualday',label: 'Annual Day', en: 'Dear Parent, Annual Day celebration is on {date}. All students must attend.', te: 'ప్రియమైన తల్లిదండ్రులకు, వార్షికోత్సవం {date} న జరుగుతుంది.' },
  { id: 'emergency',label: 'Emergency', en: 'URGENT: {message}. Please contact school immediately at {phone}.', te: 'అత్యవసరం: {message}. దయచేసి వెంటనే పాఠశాలను సంప్రదించండి.' },
]

const PAST_ALERTS = [
  { id: 1, template: 'Holiday Notice', channel: 'both', sent: '28 May 2026, 9 AM', recipients: 342, status: 'sent' as const },
  { id: 2, template: 'Fee Reminder',   channel: 'sms',  sent: '25 May 2026, 11 AM', recipients: 87,  status: 'sent' as const },
]

export function AlertsPage() {
  const toast = useToast()
  const [channel, setChannel] = useState('both')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setMessage(t.en)
  }

  async function send() {
    if (!message.trim()) { toast.error('Message cannot be empty'); return }
    setLoading(true)
    try {
      const res = await api.post('/calls/broadcast', { message, channel })
      const count = res.data?.sent ?? 0
      setMessage('')
      toast.success('Alert sent!', `Broadcast to ${count} parents via ${channel}`)
    } catch {
      toast.error('Failed to send', 'Check backend connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <Card>
        <h3 className="text-sm font-semibold text-ink-0 mb-3">Compose Alert</h3>

        {/* Templates */}
        <p className="text-xs font-medium text-ink-3 mb-2 uppercase tracking-wide">Quick Templates</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="px-3 py-1.5 rounded-btn text-xs font-medium bg-cream-300 text-ink-2 hover:bg-gold-muted hover:text-gold-dark transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>

        <Textarea
          label="Message"
          placeholder="Type your alert message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-ink-3 mt-1 text-right">{message.length} chars · ~{Math.ceil(message.length / 160)} SMS credit</p>

        <div className="mt-4 flex flex-wrap gap-3 items-end">
          <div className="w-48">
            <Select
              label="Channel"
              options={[
                { value: 'both',     label: 'WhatsApp + SMS' },
                { value: 'whatsapp', label: 'WhatsApp only' },
                { value: 'sms',      label: 'SMS only' },
              ]}
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            />
          </div>
          <Button variant="gold" loading={loading} leftIcon={<Send className="h-4 w-4" />} onClick={send}>
            Send to All Parents
          </Button>
        </div>
      </Card>

      {/* Past alerts */}
      <div>
        <h3 className="text-sm font-semibold text-ink-0 mb-3">Past Alerts</h3>
        <div className="space-y-2">
          {PAST_ALERTS.map((a) => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="flex items-center gap-3">
                <div className="p-2 bg-gold-muted rounded-btn shrink-0">
                  <Bell className="h-4 w-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-0">{a.template}</p>
                  <p className="text-xs text-ink-3">{a.sent} · {a.recipients} recipients · {a.channel}</p>
                </div>
                <Badge variant="green"><Check className="h-3 w-3 mr-1" />Sent</Badge>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
