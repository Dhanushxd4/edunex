import { useState, useEffect } from 'react'
import { Settings, Phone, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

const SCRIPT_TABS = [
  { id: 'absent', label: 'Absent Call' },
  { id: 'fee',    label: 'Fee Reminder' },
  { id: 'alarm',  label: 'Alarm Call' },
  { id: 'demo',   label: 'Demo Call' },
]

const DEFAULT_SCRIPTS: Record<string, string> = {
  absent: 'నమస్కారం. ఇది {schoolName} నుండి. మీ పిల్లలు {studentName} ఈరోజు పాఠశాలకు హాజరు కాలేదు. దయచేసి పాఠశాలను సంప్రదించగలరు. ధన్యవాదాలు.',
  fee:    'నమస్కారం. ఇది {schoolName} నుండి. మీ పిల్లలు {studentName} ఫీజు చెల్లించవలసి ఉంది. దయచేసి వీలైనంత తొందరగా చెల్లించగలరు. ధన్యవాదాలు.',
  alarm:  'నమస్కారం. ఇది {schoolName} నుండి. మీ పిల్లలు {studentName} పదవ తరగతి విద్యార్థి. పరీక్షలు సమీపిస్తున్నాయి. శ్రద్ధగా చదవండి. ధన్యవాదాలు.',
  demo:   'నమస్కారం. ఇది {schoolName} నుండి Edunex డెమో కాల్. మీ పాఠశాల అటోమేషన్ సిస్టమ్ సిద్ధంగా ఉంది. ధన్యవాదాలు.',
}

const VARIABLES = ['{studentName}', '{parentName}', '{schoolName}', '{className}', '{amount}', '{date}']

export function SettingsPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const [activeScriptTab, setActiveScriptTab] = useState('absent')
  const [scripts, setScripts] = useState(DEFAULT_SCRIPTS)
  const [callDuration, setCallDuration] = useState(60)
  const [saving, setSaving] = useState(false)
  const [testingCall, setTestingCall] = useState(false)
  const [testPhone, setTestPhone] = useState('')

  // Load saved settings from backend
  const { data: settingsData } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => api.get('/calls/settings').then((r) => r.data),
  })

  useEffect(() => {
    if (settingsData) {
      if (settingsData.scripts) setScripts({ ...DEFAULT_SCRIPTS, ...settingsData.scripts })
      if (settingsData.call_duration) setCallDuration(settingsData.call_duration)
    }
  }, [settingsData])

  const preview = scripts[activeScriptTab]
    .replace('{studentName}', 'Arjun')
    .replace('{parentName}', 'Rajesh')
    .replace('{schoolName}', user?.school_name ?? 'Your School')
    .replace('{className}', '10A')
    .replace('{amount}', '₹22,500')
    .replace('{date}', '10 June')

  async function save() {
    setSaving(true)
    try {
      await api.put('/calls/settings', { scripts, call_duration: callDuration })
      toast.success('Settings saved', 'Call scripts and duration updated')
    } catch {
      toast.error('Failed to save', 'Check connection and try again')
    } finally {
      setSaving(false)
    }
  }

  async function testCall() {
    if (!testPhone.trim()) { toast.error('Enter a phone number to test'); return }
    setTestingCall(true)
    try {
      await api.post('/calls/make', {
        phone: testPhone,
        type: 'demo',
        schoolName: user?.school_name,
        script: scripts.demo,
        duration: callDuration,
      })
      toast.success('Test call initiated', `Calling ${testPhone}`)
    } catch (err) {
      toast.error('Call failed', err instanceof Error ? err.message : 'Check Twilio credentials')
    } finally {
      setTestingCall(false)
    }
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* School profile */}
      <Card>
        <h3 className="text-sm font-semibold text-ink-0 mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-gold" /> School Profile
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="School Name"  defaultValue={user?.school_name ?? ''} disabled />
          <Input label="Principal"    defaultValue={user?.name ?? ''} disabled />
          <Input label="School Email" type="email" defaultValue={user?.email ?? ''} disabled />
        </div>
        <p className="text-xs text-ink-3 mt-3">To update school name or principal, contact Edunex Super Admin.</p>
      </Card>

      {/* Twilio / Call settings */}
      <Card>
        <h3 className="text-sm font-semibold text-ink-0 mb-4 flex items-center gap-2">
          <Phone className="h-4 w-4 text-gold" /> Call Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Test Phone Number"
            placeholder="+91XXXXXXXXXX"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            hint="Send a test call to this number"
          />
          <div>
            <label className="text-sm font-medium text-ink-2">Call Duration: {callDuration}s</label>
            <input
              type="range" min={30} max={120} step={15}
              value={callDuration}
              onChange={(e) => setCallDuration(parseInt(e.target.value))}
              className="w-full mt-2 accent-gold"
            />
            <div className="flex justify-between text-xs text-ink-3 mt-1"><span>30s</span><span>120s</span></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" loading={testingCall} leftIcon={<Phone className="h-3.5 w-3.5" />} onClick={testCall}>
            Send Test Call
          </Button>
          <Button variant="gold" size="sm" loading={saving} onClick={save}>Save Duration</Button>
        </div>
      </Card>

      {/* Call scripts */}
      <Card>
        <h3 className="text-sm font-semibold text-ink-0 mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gold" /> Call Scripts (Telugu)
        </h3>
        <Tabs tabs={SCRIPT_TABS} activeTab={activeScriptTab} onChange={setActiveScriptTab} className="mb-4" />
        <Textarea
          label={`${SCRIPT_TABS.find((t) => t.id === activeScriptTab)?.label} Script`}
          value={scripts[activeScriptTab]}
          onChange={(e) => setScripts((s) => ({ ...s, [activeScriptTab]: e.target.value }))}
          rows={4}
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {VARIABLES.map((v) => (
            <button
              key={v}
              onClick={() => setScripts((s) => ({ ...s, [activeScriptTab]: s[activeScriptTab] + ' ' + v }))}
              className="px-2 py-0.5 bg-gold-muted text-gold-dark text-xs rounded-full hover:bg-gold/20 transition-colors font-mono"
            >
              {v}
            </button>
          ))}
        </div>
        <div className="mt-4 p-3 bg-cream-300 rounded-btn">
          <p className="text-xs font-semibold text-ink-3 mb-1 flex items-center gap-1"><Eye className="h-3 w-3" /> Preview:</p>
          <p className="text-sm text-ink-1">{preview}</p>
        </div>
        <Button variant="gold" size="sm" className="mt-3" loading={saving} onClick={save}>Save Scripts</Button>
      </Card>
    </div>
  )
}
