/**
 * Edunex AI Voice Agent
 * ─────────────────────
 * Bridges Twilio Media Streams ↔ Gemini Live API for real-time
 * two-way voice conversation with parents in Telugu / English.
 *
 * Audio pipeline:
 *   Twilio → μ-law 8kHz → PCM 16kHz → Gemini Live
 *   Gemini Live → PCM 24kHz → PCM 8kHz → μ-law → Twilio
 */

import http from 'http'
import WebSocket, { WebSocketServer } from 'ws'

// ── μ-law codec (pure JS, no native deps) ────────────────────────────────────

function mulawDecode(u: number): number {
  u = ~u & 0xff
  const sign = u & 0x80
  const exp  = (u >> 4) & 0x07
  const mant = u & 0x0f
  let   mag  = ((mant << 3) + 0x84) << exp
  return sign ? -mag : mag
}

function mulawEncode(s: number): number {
  const BIAS = 0x84
  let sign = 0
  if (s < 0) { sign = 0x80; s = -s }
  if (s > 32767) s = 32767
  s += BIAS
  let exp = 7
  for (let mask = 0x4000; (s & mask) === 0 && exp > 0; mask >>= 1, exp--) {}
  const mant = (s >> (exp + 3)) & 0x0f
  return (~(sign | (exp << 4) | mant)) & 0xff
}

/** Decode μ-law buffer → 16-bit PCM buffer (8 kHz) */
function mulawToPcm(input: Buffer): Buffer {
  const out = Buffer.alloc(input.length * 2)
  for (let i = 0; i < input.length; i++) {
    out.writeInt16LE(mulawDecode(input[i]), i * 2)
  }
  return out
}

/** Upsample PCM 8 kHz → 16 kHz (linear interpolation) */
function upsample8to16(buf: Buffer): Buffer {
  const n   = buf.length >> 1          // number of 16-bit samples
  const out = Buffer.alloc(n * 4)      // double samples
  for (let i = 0; i < n; i++) {
    const s1 = buf.readInt16LE(i * 2)
    const s2 = i + 1 < n ? buf.readInt16LE((i + 1) * 2) : s1
    out.writeInt16LE(s1,                    i * 4)
    out.writeInt16LE(Math.round((s1+s2)/2), i * 4 + 2)
  }
  return out
}

/** Downsample PCM 24 kHz → 8 kHz (keep every 3rd sample) */
function downsample24to8(buf: Buffer): Buffer {
  const n   = buf.length >> 1
  const out = Buffer.alloc(Math.floor(n / 3) * 2)
  let j = 0
  for (let i = 0; i + 2 < n; i += 3) {
    out.writeInt16LE(buf.readInt16LE(i * 2), j)
    j += 2
  }
  return out
}

/** Encode 16-bit PCM buffer → μ-law buffer */
function pcmToMulaw(buf: Buffer): Buffer {
  const n   = buf.length >> 1
  const out = Buffer.alloc(n)
  for (let i = 0; i < n; i++) {
    out[i] = mulawEncode(buf.readInt16LE(i * 2))
  }
  return out
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: { studentName?: string; callType?: string; schoolName?: string }): string {
  const school = ctx.schoolName ?? 'Edunex School'
  const student = ctx.studentName ? `You are speaking with the parents of ${ctx.studentName}. ` : ''

  return `You are Priya, a warm and friendly voice assistant for ${school}, powered by Edunex LMS.
${student}
YOUR PERSONALITY:
- Sound like a real, caring human staff member — NOT a robot
- Speak naturally with a warm Indian English accent
- Use natural phrases like "Sure!", "Of course!", "Let me help you with that", "Absolutely"
- Add brief natural pauses in long sentences
- Be conversational — short sentences, easy to understand on a phone call
- Show empathy: "I understand", "That's a good question"

YOUR ROLE:
- Help parents with attendance, fees, exams, bus timings, school updates
- Answer in Telugu if the parent speaks Telugu, English otherwise
- If you don't have specific data, say "I'd suggest checking with the school office for exact details"

SPEAKING STYLE (very important):
- Never sound stiff or robotic
- Vary your sentence length naturally
- Use contractions: "I'll", "you'll", "that's", "it's"
- Occasionally use friendly fillers: "So...", "Well...", "Actually..."
- Keep responses SHORT for phone calls — 1-3 sentences max per turn
- Do NOT read out long lists — summarize naturally

Call context: ${ctx.callType ?? 'general inquiry'}`
}

// ── Voice Agent WebSocket setup ───────────────────────────────────────────────

export function setupVoiceAgent(server: http.Server): void {
  const wss = new WebSocketServer({ noServer: true })

  // Attach to the HTTP server's upgrade event
  server.on('upgrade', (req: http.IncomingMessage, socket, head) => {
    if (req.url?.startsWith('/api/voice-agent/stream')) {
      wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
    }
  })

  wss.on('connection', (twilioWs: WebSocket, req: http.IncomingMessage) => {
    // Parse query params for context
    const url    = new URL(req.url ?? '/', `http://x`)
    const ctx    = {
      studentName: url.searchParams.get('student') ?? undefined,
      callType:    url.searchParams.get('type')    ?? 'general',
      schoolName:  url.searchParams.get('school')  ?? undefined,
    }

    console.log(`🎙️ Voice agent connected — student: ${ctx.studentName ?? 'unknown'} type: ${ctx.callType}`)

    let streamSid    = ''
    let geminiWs: WebSocket | null = null
    let audioBuffer  = Buffer.alloc(0)
    const ACCUM      = 1600   // ~100 ms of μ-law at 8 kHz before forwarding

    // ── Connect to Gemini Live ──────────────────────────────────────────────
    const key = process.env.GEMINI_KEY ?? ''
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`

    geminiWs = new WebSocket(geminiUrl)

    geminiWs.on('open', () => {
      console.log('🤖 Gemini Live connected')

      // 1. Send setup
      geminiWs!.send(JSON.stringify({
        setup: {
          model: 'models/gemini-2.0-flash-live-001',
          generation_config: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: { voice_name: 'Puck' }
              }
            }
          },
          system_instruction: {
            parts: [{ text: buildSystemPrompt(ctx) }]
          }
        }
      }))
    })

    geminiWs.on('message', (data: WebSocket.RawData) => {
      try {
        const msg = JSON.parse(data.toString())

        // ── Audio from Gemini → Twilio ──────────────────────────────────────
        const parts: { inlineData?: { mimeType?: string; data?: string } }[] =
          msg?.serverContent?.modelTurn?.parts ?? []

        for (const part of parts) {
          if (part?.inlineData?.mimeType?.startsWith('audio/pcm') && part.inlineData.data) {
            const pcm24k = Buffer.from(part.inlineData.data, 'base64')
            const pcm8k  = downsample24to8(pcm24k)
            const mulaw  = pcmToMulaw(pcm8k)

            // Send in 20 ms chunks (160 bytes) to Twilio
            for (let i = 0; i < mulaw.length; i += 160) {
              const chunk = mulaw.slice(i, Math.min(i + 160, mulaw.length))
              if (twilioWs.readyState === WebSocket.OPEN && streamSid) {
                twilioWs.send(JSON.stringify({
                  event:     'media',
                  streamSid,
                  media:     { payload: chunk.toString('base64') }
                }))
              }
            }
          }
        }

        if (msg?.serverContent?.turnComplete) {
          console.log('🤖 Gemini turn complete')
        }

        // Handle setup complete — send opening greeting
        if (msg?.setupComplete) {
          console.log('🤖 Gemini setup complete — sending greeting')
        }

      } catch { /* ignore JSON parse errors */ }
    })

    geminiWs.on('error', err => console.error('🤖 Gemini error:', (err as Error).message))
    geminiWs.on('close', ()  => console.log('🤖 Gemini disconnected'))

    // ── Messages from Twilio ────────────────────────────────────────────────
    twilioWs.on('message', (data: WebSocket.RawData) => {
      try {
        const msg = JSON.parse(data.toString())

        if (msg.event === 'start') {
          streamSid = msg.start.streamSid
          console.log(`🎙️ Stream started: ${streamSid}`)

          // Send greeting text once stream is live
          if (geminiWs?.readyState === WebSocket.OPEN) {
            const greet = ctx.studentName
              ? `Greet the parent warmly and naturally. Introduce yourself as Priya from ${ctx.schoolName ?? 'Edunex School'}. Mention you're calling about their child ${ctx.studentName}. Ask how you can help them today. Keep it short and friendly — like a real person would say it on a phone call.`
              : `Greet the caller warmly and naturally. Introduce yourself as Priya from ${ctx.schoolName ?? 'Edunex School'}. Ask how you can help them today. Keep it short and friendly — like a real person would say it on a phone call.`

            geminiWs.send(JSON.stringify({
              client_content: {
                turns: [{ role: 'user', parts: [{ text: greet }] }],
                turn_complete: true
              }
            }))
          }
        }

        if (msg.event === 'media' && geminiWs?.readyState === WebSocket.OPEN) {
          // Accumulate μ-law chunks, convert and forward to Gemini
          audioBuffer = Buffer.concat([audioBuffer, Buffer.from(msg.media.payload, 'base64')])

          if (audioBuffer.length >= ACCUM) {
            const chunk  = audioBuffer.slice(0, ACCUM)
            audioBuffer  = audioBuffer.slice(ACCUM)
            const pcm8k  = mulawToPcm(chunk)
            const pcm16k = upsample8to16(pcm8k)

            geminiWs.send(JSON.stringify({
              realtime_input: {
                media_chunks: [{
                  data:      pcm16k.toString('base64'),
                  mime_type: 'audio/pcm;rate=16000'
                }]
              }
            }))
          }
        }

        if (msg.event === 'stop') {
          console.log('🎙️ Twilio stream stopped')
          geminiWs?.close()
        }
      } catch { /* ignore parse errors */ }
    })

    twilioWs.on('error', (err) => {
      console.error('WebSocket error:', (err as Error).message)
      geminiWs?.close()
    })

    twilioWs.on('close', () => {
      console.log('Twilio disconnected')
      geminiWs?.close()
    })
  })
}
