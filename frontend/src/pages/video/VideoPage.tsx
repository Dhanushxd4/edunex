import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Upload, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'

const VOICES = [
  { value: 'te-IN-ShrutiNeural',  label: 'Telugu — Shruti (Female)' },
  { value: 'te-IN-MohanNeural',   label: 'Telugu — Mohan (Male)' },
  { value: 'en-IN-NeerjaNeural',  label: 'English — Neerja (Female)' },
  { value: 'en-IN-PrabhatNeural', label: 'English — Prabhat (Male)' },
  { value: 'hi-IN-SwaraNeural',   label: 'Hindi — Swara (Female)' },
]

const SCRIPT_TYPES = [
  { value: 'admission', label: 'Admission Promo' },
  { value: 'fee',       label: 'Fee Reminder' },
  { value: 'holiday',   label: 'Holiday Notice' },
  { value: 'custom',    label: 'Custom Script' },
]

const DEFAULT_SCRIPTS: Record<string, string> = {
  admission: 'నమస్కారం. మా పాఠశాలలో చేరడానికి ఆహ్వానిస్తున్నాం. అద్భుతమైన చదువు, మంచి భవిష్యత్తు.',
  fee:       'నమస్కారం. ఫీజు చెల్లించే సమయం వచ్చింది. దయచేసి తొందరగా చెల్లించండి.',
  holiday:   'నమస్కారం. రేపు పాఠశాల సెలవు. అందరూ ఇంట్లో ఉండండి.',
  custom:    '',
}

export function VideoPage() {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [scriptType, setScriptType] = useState('admission')
  const [voice, setVoice]           = useState('te-IN-ShrutiNeural')
  const [script, setScript]         = useState(DEFAULT_SCRIPTS.admission)
  const [photo, setPhoto]           = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [videoUrl, setVideoUrl]     = useState<string | null>(null)
  const [talkId, setTalkId]         = useState<string | null>(null)
  const [stage, setStage]           = useState<'idle' | 'uploading' | 'processing' | 'polling' | 'done'>('idle')

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  function onScriptTypeChange(type: string) {
    setScriptType(type)
    if (type !== 'custom') setScript(DEFAULT_SCRIPTS[type])
  }

  async function generate() {
    if (!photo)         { toast.error('Upload a photo first');   return }
    if (!script.trim()) { toast.error('Script cannot be empty'); return }

    setGenerating(true)
    setVideoUrl(null)

    try {
      setStage('uploading')
      // Call real D-ID backend route
      const { data: createData } = await api.post<{ talkId: string; status: string }>('/ai/video', {
        photoBase64: photo,
        script,
        voice,
      })

      setTalkId(createData.talkId)
      setStage('processing')

      // Poll for completion
      setStage('polling')
      let attempts = 0
      while (attempts < 30) {
        await new Promise((r) => setTimeout(r, 3000))
        const { data: pollData } = await api.get<{ status: string; videoUrl: string | null }>(`/ai/video/${createData.talkId}`)
        if (pollData.status === 'done' && pollData.videoUrl) {
          setVideoUrl(pollData.videoUrl)
          setStage('done')
          toast.success('Video ready!', 'Your AI talking video has been generated')
          break
        }
        if (pollData.status === 'error') {
          throw new Error('D-ID reported an error generating the video')
        }
        attempts++
      }
      if (attempts >= 30) throw new Error('Video generation timed out')
    } catch (err) {
      toast.error('Video generation failed', err instanceof Error ? err.message : 'Check D-ID API key in backend .env')
      setStage('idle')
    } finally {
      setGenerating(false)
    }
  }

  const STAGES = [
    { key: 'uploading',  label: 'Uploading photo' },
    { key: 'processing', label: 'Processing audio' },
    { key: 'polling',    label: 'Rendering video' },
  ]

  return (
    <div className="space-y-5 animate-fadeUp max-w-2xl">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gold-muted rounded-btn"><Video className="h-4 w-4 text-gold" /></div>
          <h3 className="text-base font-semibold text-ink-0">AI Talking Video</h3>
          <Badge variant="gold">AI Avatar</Badge>
        </div>

        {/* Photo upload */}
        <div className="mb-4">
          <p className="text-sm font-medium text-ink-2 mb-2">Principal Photo</p>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-black/15 rounded-btn cursor-pointer hover:border-gold/50 transition-colors">
            {photo
              ? <img src={photo} alt="Principal" className="h-16 w-16 rounded-full object-cover" />
              : <div className="h-16 w-16 rounded-full bg-cream-300 flex items-center justify-center"><Upload className="h-6 w-6 text-ink-3" /></div>}
            <div>
              <p className="text-sm font-medium text-ink-1">Upload photo</p>
              <p className="text-xs text-ink-3">JPG or PNG · Clear face photo required</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select label="Script Type" options={SCRIPT_TYPES} value={scriptType} onChange={(e) => onScriptTypeChange(e.target.value)} />
          <Select label="Voice" options={VOICES} value={voice} onChange={(e) => setVoice(e.target.value)} />
        </div>
        <Textarea label="Script" value={script} onChange={(e) => setScript(e.target.value)} rows={3} />

        <Button variant="gold" className="mt-4 w-full" loading={generating} leftIcon={<Sparkles className="h-4 w-4" />} onClick={generate}>
          {generating ? `${STAGES.find((s) => s.key === stage)?.label ?? 'Processing'}…` : 'Generate AI Video'}
        </Button>

        {!talkId && (
          <p className="text-xs text-ink-3 text-center mt-2">
            Requires D-ID API key in backend/.env → DID_KEY
          </p>
        )}
      </Card>

      {/* Progress */}
      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="space-y-3">
              {STAGES.map((s, i) => {
                const stageOrder = STAGES.map((st) => st.key)
                const currentIdx = stageOrder.indexOf(stage)
                const thisIdx    = stageOrder.indexOf(s.key)
                const isDone     = currentIdx > thisIdx
                const isActive   = currentIdx === thisIdx
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-success text-white' : isActive ? 'bg-gold text-white' : 'bg-cream-400 text-ink-3'}`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-gold font-medium' : isDone ? 'text-success' : 'text-ink-3'}`}>
                      {s.label}{isActive && <span className="ml-1 animate-pulse">…</span>}
                    </span>
                  </div>
                )
              })}
            </Card>
          </motion.div>
        )}

        {videoUrl && !generating && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center">
              <Video className="h-10 w-10 text-gold mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink-0 mb-3">Your AI video is ready!</p>
              <video src={videoUrl} controls className="w-full rounded-btn mb-3" />
              <div className="flex gap-3 justify-center">
                <a href={videoUrl} download="edunex-video.mp4">
                  <Button variant="gold" leftIcon={<Download className="h-4 w-4" />}>Download MP4</Button>
                </a>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
