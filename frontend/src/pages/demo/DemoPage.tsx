import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'

export function DemoPage() {
  const { user } = useAuthStore()
  const toast = useToast()
  const [phone, setPhone] = useState('')
  const [calling, setCalling] = useState(false)
  const [called, setCalled] = useState(false)
  const [error, setError] = useState('')

  function validate() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid 10-digit number'); return false }
    setError('')
    return true
  }

  async function makeCall() {
    if (!validate()) return
    setCalling(true)
    setCalled(false)
    try {
      await api.post('/calls/make', {
        phone: phone.replace(/\D/g, '').slice(-10),
        type: 'demo',
        studentName: 'Demo',
        parentName: 'Valued Client',
        schoolName: user?.school_name ?? 'Edunex School',
      })
      setCalled(true)
      toast.success('Demo call initiated', 'Client will receive the call in ~10 seconds')
    } catch (err) {
      toast.error('Call failed', err instanceof Error ? err.message : 'Check backend')
    } finally {
      setCalling(false)
    }
  }

  return (
    <div className="max-w-md space-y-5 animate-fadeUp">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gold-muted rounded-card">
            <Phone className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-0">Demo Call</h3>
            <p className="text-xs text-ink-3">Use during client presentations</p>
          </div>
        </div>

        <Input
          label="Client Phone Number"
          type="tel"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError('') }}
          error={error}
          hint="The client will hear your school name in Telugu"
        />

        <Button
          variant="gold"
          className="w-full mt-4"
          loading={calling}
          leftIcon={<PhoneCall className="h-4 w-4" />}
          onClick={makeCall}
        >
          {calling ? 'Calling…' : 'Make Demo Call'}
        </Button>
      </Card>

      <AnimatePresence>
        {called && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-5 border-2 border-success/30 bg-success/5 text-center"
          >
            <PhoneCall className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-sm font-semibold text-success">Call initiated successfully!</p>
            <p className="text-xs text-ink-3 mt-1">
              Client at {phone} will hear: <i>"నమస్కారం. ఇది {user?.school_name ?? 'your school'} నుండి Edunex డెమో కాల్."</i>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <p className="text-xs text-ink-3 font-medium mb-2">What the client hears:</p>
        <p className="text-sm text-ink-1 leading-relaxed bg-cream-300 p-3 rounded-btn">
          "నమస్కారం. ఇది <span className="text-gold font-medium">{user?.school_name ?? '[School Name]'}</span> నుండి Edunex డెమో కాల్. మీ పాఠశాల అటోమేషన్ సిస్టమ్ సిద్ధంగా ఉంది. ధన్యవాదాలు."
        </p>
      </Card>
    </div>
  )
}
