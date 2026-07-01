/**
 * Calling provider abstraction — Twilio or Exotel.
 * ─────────────────────────────────────────────────
 * Set CALL_PROVIDER=exotel in .env to switch. Defaults to 'twilio' so nothing
 * breaks for existing deployments that haven't added Exotel credentials yet.
 *
 * IMPORTANT — Exotel setup is not pure-API like Twilio's inline TwiML.
 * Twilio lets you pass TwiML text directly in the API call. Exotel instead
 * requires a pre-built call "Flow" (created once in the Exotel dashboard /
 * App Bazaar) whose Connect/Greeting applet is configured to fetch dynamic
 * text from a URL — that's what GET /api/calls/exotel-tts is for below.
 * One-time setup on the Exotel side:
 *   1. Log into my.exotel.com → App Bazaar → create a new Flow
 *   2. Add a "Connect" or "Greeting" applet → "Read text like a robot" →
 *      choose the URL option → point it at:
 *      {BACKEND_URL}/api/calls/exotel-tts?text=PLACEHOLDER
 *      (Exotel will call this URL with the actual call context; see docs)
 *   3. Copy the Flow's App ID into EXOTEL_APP_ID in .env
 * Docs: https://developer.exotel.com/api/outgoing-call-to-connect-number-to-a-call-flow
 */

import axios from 'axios'

export type CallProvider = 'twilio' | 'exotel'

export function getCallProvider(): CallProvider {
  const p = (process.env.CALL_PROVIDER || 'twilio').toLowerCase()
  return p === 'exotel' ? 'exotel' : 'twilio'
}

function exotelConfig() {
  const sid   = process.env.EXOTEL_SID!
  const token = process.env.EXOTEL_TOKEN!
  const key   = process.env.EXOTEL_API_KEY!
  const subdomain = process.env.EXOTEL_SUBDOMAIN || 'api.in.exotel.com' // api.exotel.com for accounts outside India
  if (!sid || !token || !key || sid.startsWith('your_')) {
    throw new Error('Exotel credentials not configured. Add EXOTEL_SID, EXOTEL_API_KEY, EXOTEL_TOKEN to backend .env')
  }
  return {
    sid, token, key, subdomain,
    baseUrl: `https://${subdomain}/v1/Accounts/${sid}`,
    auth: { username: key, password: token },
  }
}

export interface VoiceCallOptions {
  to: string
  from: string
  /** Text to be read out via TTS (Twilio: inline <Say>. Exotel: served from /exotel-tts, see EXOTEL_APP_ID note above). */
  script?: string
  /** For advanced flows (Twilio TwiML URL / Exotel Flow App URL) */
  callbackUrl?: string
  statusCallbackUrl?: string
  timeoutSec?: number
  timeLimitSec?: number
}

export interface VoiceCallResult {
  provider: CallProvider
  sid: string
  status: string
}

/** Make an outbound voice call using whichever provider is configured. */
export async function makeVoiceCall(opts: VoiceCallOptions): Promise<VoiceCallResult> {
  if (getCallProvider() === 'exotel') {
    const cfg = exotelConfig()
    const appId = process.env.EXOTEL_APP_ID
    if (!appId) {
      throw new Error('EXOTEL_APP_ID not set. Create a Flow in Exotel App Bazaar and set its App ID — see comments in lib/calling.ts')
    }
    // Encode the script so the pre-built Flow's dynamic-text applet can read it back via /exotel-tts
    const encodedScript = opts.script ? encodeURIComponent(opts.script) : ''
    const flowUrl = `http://my.exotel.com/${cfg.sid}/exoml/start_voice/${appId}?script=${encodedScript}`

    const body = new URLSearchParams({
      From: opts.to,          // Exotel calls "From" first, then connects — so the parent's number goes here
      CallerId: opts.from,    // your Exotel virtual number
      Url: flowUrl,
      TimeLimit: String(opts.timeLimitSec ?? 60),
      TimeOut: String(opts.timeoutSec ?? 30),
      ...(opts.statusCallbackUrl ? { StatusCallback: opts.statusCallbackUrl } : {}),
    })

    const { data } = await axios.post(`${cfg.baseUrl}/Calls/connect.json`, body, { auth: cfg.auth })
    return { provider: 'exotel', sid: data?.Call?.Sid ?? data?.Call?.Id ?? 'unknown', status: data?.Call?.Status ?? 'initiated' }
  }

  // ── Twilio (default) ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio')
  const sid   = process.env.TWILIO_SID!
  const token = process.env.TWILIO_TOKEN!
  if (!sid || !token || sid.startsWith('your_')) {
    throw new Error('Twilio credentials not configured. Add TWILIO_SID and TWILIO_TOKEN to backend .env')
  }
  const client = twilio(sid, token)
  const call = await client.calls.create({
    from: opts.from,
    to:   opts.to,
    ...(opts.callbackUrl
      ? { url: opts.callbackUrl }
      : { twiml: `<Response><Say language="te-IN" voice="Google.te-IN-Standard-A">${opts.script ?? ''}</Say></Response>` }),
    timeout:   opts.timeoutSec ?? 30,
    timeLimit: opts.timeLimitSec ?? 60,
    ...(opts.statusCallbackUrl ? { statusCallback: opts.statusCallbackUrl, statusCallbackMethod: 'POST' } : {}),
  })
  return { provider: 'twilio', sid: call.sid, status: call.status }
}

export interface SmsOptions { to: string; from: string; message: string }
export interface SmsResult { provider: CallProvider; sid: string; status: string }

/** Send an SMS using whichever provider is configured. */
export async function sendSms(opts: SmsOptions): Promise<SmsResult> {
  if (getCallProvider() === 'exotel') {
    const cfg = exotelConfig()
    const body = new URLSearchParams({ From: opts.from, To: opts.to, Body: opts.message })
    const { data } = await axios.post(`${cfg.baseUrl}/Sms/send.json`, body, { auth: cfg.auth })
    return { provider: 'exotel', sid: data?.SMSMessage?.Sid ?? 'unknown', status: data?.SMSMessage?.Status ?? 'queued' }
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio')
  const sid   = process.env.TWILIO_SID!
  const token = process.env.TWILIO_TOKEN!
  const client = twilio(sid, token)
  const msg = await client.messages.create({ from: opts.from, to: opts.to, body: opts.message })
  return { provider: 'twilio', sid: msg.sid, status: msg.status }
}
