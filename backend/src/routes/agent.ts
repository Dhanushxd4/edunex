import { Router, type Request, type Response } from 'express'
import twilio from 'twilio'
import { supabase } from '../lib/supabase'

const router = Router()

function sanitizePhone(phone: string): string {
  return `+91${phone.replace(/\D/g, '').slice(-10)}`
}

async function makeCall(to: string, script: string, from: string, duration = 60) {
  const sid   = process.env.TWILIO_SID!
  const token = process.env.TWILIO_TOKEN!
  if (!sid || sid === 'your_twilio_account_sid') return

  const client = twilio(sid, token)
  await client.calls.create({
    from,
    to: sanitizePhone(to),
    twiml: `<Response><Say language="te-IN" voice="Polly.Aditi">${script}</Say></Response>`,
    timeout:   30,
    timeLimit: duration,
  })
}

// GET /api/agent/absence — called by Vercel cron at 9:00 AM IST (3:30 AM UTC)
router.get('/absence', async (_req: Request, res: Response) => {
  try {
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, twilio_number, call_duration')
      .eq('status', 'active')

    if (!schools?.length) { res.json({ success: true, data: { processed: 0 } }); return }

    let totalCalls = 0
    for (const school of schools) {
      const from = school.twilio_number || process.env.TWILIO_NUMBER!

      const { data: absent } = await supabase
        .from('students')
        .select('name, phone, parent')
        .eq('school_id', school.id)
        .eq('absent', true)

      for (const student of absent || []) {
        const script = `నమస్కారం. ఇది ${school.name} నుండి. మీ పిల్లలు ${student.name} ఈరోజు పాఠశాలకు హాజరు కాలేదు. దయచేసి పాఠశాలను సంప్రదించగలరు. ధన్యవాదాలు.`
        await makeCall(student.phone, script, from, school.call_duration || 60)
        totalCalls++
      }
    }

    res.json({ success: true, data: { processed: totalCalls } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Agent run failed' })
  }
})

// GET /api/agent/fee — called by Vercel cron at 11:00 AM IST (5:30 AM UTC)
router.get('/fee', async (_req: Request, res: Response) => {
  try {
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, twilio_number, call_duration')
      .eq('status', 'active')

    let totalCalls = 0
    for (const school of schools || []) {
      const from = school.twilio_number || process.env.TWILIO_NUMBER!

      const { data: overdue } = await supabase
        .from('students')
        .select('name, phone')
        .eq('school_id', school.id)
        .in('fee_status', ['pending', 'overdue'])

      for (const student of overdue || []) {
        const script = `నమస్కారం. ఇది ${school.name} నుండి. మీ పిల్లలు ${student.name} ఫీజు చెల్లించవలసి ఉంది. దయచేసి తొందరగా చెల్లించగలరు. ధన్యవాదాలు.`
        await makeCall(student.phone, script, from, school.call_duration || 60)
        totalCalls++
      }
    }

    res.json({ success: true, data: { processed: totalCalls } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Fee agent failed' })
  }
})

// GET /api/agent/alarm — called by Vercel cron at 5:00 AM IST (11:30 PM UTC prev day)
router.get('/alarm', async (_req: Request, res: Response) => {
  try {
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, twilio_number, call_duration')
      .eq('status', 'active')

    let totalCalls = 0
    for (const school of schools || []) {
      const from = school.twilio_number || process.env.TWILIO_NUMBER!

      const { data: students } = await supabase
        .from('students')
        .select('name, phone')
        .eq('school_id', school.id)
        .eq('cls', '10A')

      for (const student of students || []) {
        const script = `నమస్కారం. ఇది ${school.name} నుండి. మీ పిల్లలు ${student.name} పదవ తరగతి విద్యార్థి. పరీక్షలు సమీపిస్తున్నాయి. శ్రద్ధగా చదవండి. ధన్యవాదాలు.`
        await makeCall(student.phone, script, from, school.call_duration || 60)
        totalCalls++
      }
    }

    res.json({ success: true, data: { processed: totalCalls } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Alarm agent failed' })
  }
})

// GET /api/agent/report — called by Vercel cron at 6:00 PM IST (12:30 PM UTC)
router.get('/report', async (_req: Request, res: Response) => {
  try {
    const { data: schools } = await supabase
      .from('schools')
      .select('id, name, twilio_number, call_duration')
      .eq('status', 'active')

    let totalCalls = 0
    for (const school of schools || []) {
      const from = school.twilio_number || process.env.TWILIO_NUMBER!

      const { data: students } = await supabase
        .from('students')
        .select('name, phone, cls')
        .eq('school_id', school.id)

      for (const student of students || []) {
        const script = `నమస్కారం. ఇది ${school.name} నుండి. ${student.name} యొక్క నేటి హాజరు నివేదిక. వివరాల కోసు పోర్టల్ చెక్ చేయండి. ధన్యవాదాలు.`
        await makeCall(student.phone, script, from, school.call_duration || 60)
        totalCalls++
      }
    }

    res.json({ success: true, data: { processed: totalCalls } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Report agent failed' })
  }
})

export default router
