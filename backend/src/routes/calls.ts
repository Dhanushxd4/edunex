import { Router, type Request, type Response } from 'express'
import twilio from 'twilio'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()

function getTwilioClient() {
  const sid   = process.env.TWILIO_SID!
  const token = process.env.TWILIO_TOKEN!
  if (!sid || !token || sid === 'your_twilio_account_sid') {
    throw new Error('Twilio credentials not configured. Add TWILIO_SID and TWILIO_TOKEN to backend .env')
  }
  return twilio(sid, token)
}

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

    const client = getTwilioClient()
    const call = await client.calls.create({
      from: fromNumber,
      to:   sanitizePhone(phone),
      twiml: `<Response><Say language="te-IN" voice="Google.te-IN-Standard-A">${callScript}</Say></Response>`,
      timeout:   30,
      timeLimit: callDuration,
    })

    // Log to database
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

    res.json({ success: true, data: { sid: call.sid, status: call.status } })
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

    const client = getTwilioClient()
    const msg = await client.messages.create({
      from: fromNumber,
      to:   sanitizePhone(phone),
      body: message,
    })

    res.json({ success: true, data: { sid: msg.sid, status: msg.status } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'SMS failed' })
  }
})

// POST /api/calls/broadcast — bulk SMS to multiple numbers
router.post('/broadcast', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { phones, message } = req.body as { phones: string[]; message: string }

    if (!phones?.length || !message) {
      res.status(400).json({ success: false, error: 'Phones array and message are required' })
      return
    }

    const { data: school } = await supabase
      .from('schools')
      .select('twilio_number')
      .eq('id', req.schoolId!)
      .single()

    const fromNumber = school?.twilio_number || process.env.TWILIO_NUMBER!
    const client = getTwilioClient()

    const results = await Promise.allSettled(
      phones.map((phone) =>
        client.messages.create({
          from: fromNumber,
          to:   sanitizePhone(phone),
          body: message,
        }),
      ),
    )

    const sent   = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    res.json({ success: true, data: { sent, failed, total: phones.length } })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Broadcast failed' })
  }
})

// ── AI Voice Agent ────────────────────────────────────────────────────────────

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

    const client = getTwilioClient()

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
  console.log(`📞 Voice agent call status: ${req.body.CallStatus} — SID: ${req.body.CallSid}`)
  res.sendStatus(200)
})

export default router
