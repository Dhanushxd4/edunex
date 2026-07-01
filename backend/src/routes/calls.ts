import { Router, type Request, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { makeVoiceCall, sendSms, getCallProvider } from '../lib/calling'

const router = Router()

// getTwilioClient() removed — calling.ts now abstracts Twilio/Exotel behind
// makeVoiceCall()/sendSms(). Set CALL_PROVIDER=exotel in .env to switch.

function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10)
  return `+91${digits}`
}

// POST /api/calls/make — outbound voice call
router.post('/make', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      phone,
      type = 'absent',
      studentName = '',
      parentName  = '',
      schoolName  = '',
      script,
      duration,
    } = req.body as {
      phone: string
      type?: string
      studentName?: string
      parentName?: string
      schoolName?: string
      script?: string
      duration?: number
    }

    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number is required' })
      return
    }

    // Fetch school settings for Twilio number and script
    const { data: school } = await supabase
      .from('schools')
      .select('twilio_number, call_duration, name')
      .eq('id', req.schoolId!)
      .single()

    const fromNumber = school?.twilio_number || process.env.TWILIO_NUMBER!
    const callDuration = duration || school?.call_duration || 60
    const sName = schoolName || school?.name || 'Your School'

    // Build TwiML script
    const defaultScripts: Record<string, string> = {
      absent:  `నమస్కారం ${parentName || 'తల్లిదండ్రులకు'}. ఇది ${sName} నుండి ముఖ్యమైన సమాచారం. మీ అబ్బాయి లేదా అమ్మాయి ${studentName} ఈరోజు పాఠశాలకు హాజరు కాలేదు. దయచేసి వీలైనంత తొందరగా పాఠశాలను సంప్రదించగలరు. మా నంబర్ కు తిరిగి కాల్ చేయగలరు. ధన్యవాదాలు.`,
      fee:     `నమస్కారం ${parentName || 'తల్లిదండ్రులకు'}. ఇది ${sName} నుండి. మీ పిల్లలు ${studentName} యొక్క పాఠశాల ఫీజు చెల్లించవలసి ఉంది. దయచేసి వీలైనంత తొందరగా ఫీజు చెల్లించగలరు. మరింత సమాచారానికి పాఠశాలను సంప్రదించగలరు. ధన్యవాదాలు.`,
      exam:    `నమస్కారం ${parentName || 'తల్లిదండ్రులకు'}. ఇది ${sName} నుండి. మీ పిల్లలు ${studentName} యొక్క పరీక్షలు సమీపిస్తున్నాయి. దయచేసి మీ పిల్లలు సరిగ్గా చదవడానికి ప్రోత్సహించగలరు. మంచి ఫలితాలను ఆశిస్తున్నాం. ధన్యవాదాలు.`,
      alarm:   `నమస్కారం ${parentName || 'తల్లిదండ్రులకు'}. ఇది ${sName} నుండి ముఖ్యమైన సందేశం. దయచేసి వీలైనంత తొందరగా పాఠశాలను సంప్రదించగలరు. ధన్యవాదాలు.`,
      demo:    `నమస్కారం. ఇది ${sName} నుండి Edunex స్కూల్ మేనేజ్మెంట్ సిస్టమ్ ద్వారా పంపిన డెమో కాల్. మీ పాఠశాల ఆటోమేషన్ సిస్టమ్ సిద్ధంగా ఉంది. ధన్యవాదాలు.`,
      result:  `నమస్కారం ${parentName || 'తల్లిదండ్రులకు'}. ఇది ${sName} నుండి. మీ పిల్లలు ${studentName} యొక్క పరీక్ష ఫలితాలు వచ్చాయి. దయచేసి పాఠశాలకు వచ్చి ఫలితాలు తీసుకోగలరు. ధన్యవాదాలు.`,
    }

    const callScript = script || defaultScripts[type] || defaultScripts.absent

    const call = await makeVoiceCall({
      from: fromNumber,
      to:   sanitizePhone(phone),
      script: callScript,
      timeoutSec: 30,
      timeLimitSec: callDuration,
    })

    // Log to database (twilio_sid column now holds either provider's call SID)
    await supabase.from('calls').insert({
      school_id:   req.schoolId!,
      student_id:  null,
      student_name: studentName,
      parent_phone: sanitizePhone(phone),
      type,
      status:       'initiated',
      twilio_sid:   call.sid,
      called_at:    new Date().toISOString(),
    })

    res.json({ success: true, data: { sid: call.sid, status: call.status, provider: call.provider } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Call failed' })
  }
})

// POST /api/calls/sms — send SMS
router.post('/sms', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { phone, message } = req.body as { phone: string; message: string }

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'Phone and message are required' })
      return
    }

    const { data: school } = await supabase
      .from('schools')
      .select('twilio_number')
      .eq('id', req.schoolId!)
      .single()

    const fromNumber = school?.twilio_number || process.env.TWILIO_NUMBER!

    const msg = await sendSms({ from: fromNumber, to: sanitizePhone(phone), message })

    res.json({ success: true, data: { sid: msg.sid, status: msg.status, provider: msg.provider } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'SMS failed' })
  }
})


// GET /api/calls/settings — load call scripts + duration from Supabase Storage
router.get('/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const path = `${req.schoolId}/settings.json`
    const { data, error } = await supabase.storage.from('school-settings').download(path)
    if (error || !data) {
      res.json({ success: true, data: { scripts: {}, call_duration: 60 } })
      return
    }
    const text = await data.text()
    res.json({ success: true, data: JSON.parse(text) })
  } catch {
    res.json({ success: true, data: { scripts: {}, call_duration: 60 } })
  }
})

// PUT /api/calls/settings — save call scripts + duration to Supabase Storage
router.put('/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { scripts, call_duration } = req.body as { scripts: Record<string, string>; call_duration: number }
    const path    = `${req.schoolId}/settings.json`
    const payload = JSON.stringify({ scripts, call_duration, updated_at: new Date().toISOString() })
    const blob    = new Blob([payload], { type: 'application/json' })
    const { error } = await supabase.storage.from('school-settings').upload(path, blob, {
      upsert: true,
      contentType: 'application/json',
    })
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Failed to save settings' })
  }
})

// ── Broadcast ─────────────────────────────────────────────────────────────────

// POST /api/calls/broadcast (alerts page) — call all school parents
router.post('/broadcast', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, channel = 'both' } = req.body as { message: string; channel?: string }
    if (!message?.trim()) {
      res.status(400).json({ success: false, error: 'Message is required' })
      return
    }

    const { data: students } = await supabase
      .from('students')
      .select('name, phone, parent')
      .eq('school_id', req.schoolId!)
      .not('phone', 'is', null)

    if (!students?.length) {
      res.json({ success: true, data: { sent: 0, message: 'No students with phone numbers found' } })
      return
    }

    const { data: school } = await supabase
      .from('schools')
      .select('name, twilio_number')
      .eq('id', req.schoolId!)
      .single()

    const fromNumber = school?.twilio_number || process.env.TWILIO_NUMBER!
    const schoolName = school?.name || 'Your School'

    let sent = 0

    // Fire calls in batches of 5 (rate-limit friendly for both Twilio and Exotel)
    const chunks: typeof students[] = []
    for (let i = 0; i < students.length; i += 5) chunks.push(students.slice(i, i + 5))

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(async (student) => {
          try {
            if (channel === 'call' || channel === 'both') {
              const script = `${message} - This message is from ${schoolName}.`
              await makeVoiceCall({
                from: fromNumber,
                to: sanitizePhone(student.phone),
                script,
                timeoutSec: 30,
              })
            }
            sent++
          } catch { /* skip failed numbers */ }
        }),
      )
    }

    res.json({ success: true, data: { sent, total: students.length } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Broadcast failed' })
  }
})

// ── AI Voice Agent ────────────────────────────────────────────────────────────
// NOTE: the real-time two-way agent below stays on Twilio regardless of
// CALL_PROVIDER. It relies on Twilio's Media Streams WebSocket protocol
// (see lib/../routes/voice-agent.ts). Exotel has an equivalent (AgentStream,
// currently beta) but its message format differs and hasn't been ported —
// migrating this specific feature is a separate, bigger job.

// POST /api/calls/voice-agent — initiate outbound AI conversation call
router.post('/voice-agent', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { phone, studentName, callType = 'general', schoolName } = req.body as {
      phone: string; studentName?: string; callType?: string; schoolName?: string
    }

    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number required' })
      return
    }

    const sid   = process.env.TWILIO_SID!
    const token = process.env.TWILIO_TOKEN!
    if (!sid || !token || sid.startsWith('your_')) {
      res.status(400).json({ success: false, error: 'Twilio credentials required for the real-time voice agent (Exotel not yet supported for this feature)' })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const client = require('twilio')(sid, token)

    const { data: school } = await supabase
      .from('schools')
      .select('name, twilio_number')
      .eq('id', req.schoolId!)
      .single()

    const fromNumber  = school?.twilio_number || process.env.TWILIO_NUMBER!
    const backendUrl  = process.env.BACKEND_URL || 'https://edunex-api-production.up.railway.app'
    const wsBase      = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')

    const params = new URLSearchParams()
    if (studentName) params.set('student', studentName)
    if (callType)    params.set('type', callType)
    if (schoolName || school?.name) params.set('school', schoolName || school?.name || '')

    // TwiML URL — Twilio will GET this when the call connects
    const twimlUrl = `${backendUrl}/api/calls/voice-agent-twiml?${params.toString()}`

    const call = await client.calls.create({
      to:   sanitizePhone(phone),
      from: fromNumber,
      url:  twimlUrl,
      statusCallback: `${backendUrl}/api/calls/voice-agent-status`,
      statusCallbackMethod: 'POST',
    })

    res.json({ success: true, data: { sid: call.sid, status: call.status } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Voice agent call failed' })
  }
})

// GET /api/calls/voice-agent-twiml — Twilio fetches this when call connects
router.get('/voice-agent-twiml', (req: Request, res: Response) => {
  const backendUrl = process.env.BACKEND_URL || 'https://edunex-api-production.up.railway.app'
  const wsBase     = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://')

  // Forward all query params to the WebSocket stream URL (student, type, school)
  const params = new URLSearchParams(req.query as Record<string, string>)
  const streamUrl = `${wsBase}/api/voice-agent/stream?${params.toString()}`

  res.set('Content-Type', 'text/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}" />
  </Connect>
</Response>`)
})

// POST /api/calls/voice-agent-status — Twilio status callback
router.post('/voice-agent-status', (req: Request, res: Response) => {
  console.log('📞 Voice agent call status:', req.body?.CallStatus, req.body?.CallSid)
  res.sendStatus(200)
})

// ── Exotel dynamic TTS text ────────────────────────────────────────────────────
// GET /api/calls/exotel-tts — Exotel's Connect/Greeting applet fetches plain
// text from this URL and reads it out via their TTS engine. Point your Exotel
// Flow's "Read text like a robot" (URL option) here. See lib/calling.ts for
// the one-time Exotel dashboard setup this depends on.
router.get('/exotel-tts', (req: Request, res: Response) => {
  const script = (req.query.script as string) || 'Hello, this is a message from your school.'
  res.set('Content-Type', 'text/plain')
  res.send(script)
})

// GET /api/calls/provider — which calling provider is currently active (for the frontend settings UI)
router.get('/provider', requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { provider: getCallProvider() } })
})

export default router
