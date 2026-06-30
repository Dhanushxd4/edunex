import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Polyfill WebSocket for Supabase Realtime on Node < 22
if (typeof globalThis.WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.WebSocket = require('ws')
}

import authRoutes      from './routes/auth'
import callRoutes      from './routes/calls'
import aiRoutes        from './routes/ai'
import agentRoutes     from './routes/agent'
import studentRoutes   from './routes/students'
import teacherRoutes   from './routes/teachers'
import dashboardRoutes from './routes/dashboard'
import feeRoutes       from './routes/fees'
import enquiryRoutes   from './routes/enquiries'
import adminRoutes     from './routes/admin'
import busRoutes       from './routes/bus'
import parentRoutes    from './routes/parents'
import videoRoutes     from './routes/video'
import { setupVoiceAgent } from './routes/voice-agent'
import courseRoutes from './routes/courses'
import { errorHandler } from './middleware/errorHandler'

const app  = express()
const PORT = parseInt(process.env.PORT || '4000', 10)

// ── Gzip compression (saves 60-80 % bandwidth) ───────────────────────────────
// Use dynamic require so the optional dep doesn't break the build if absent
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const compression = require('compression')
  app.use(compression())
} catch { /* compression package not installed — skip */ }

// ── Trust Railway / Vercel proxy ─────────────────────────────────────────────
// Railway sits behind a load balancer that sets X-Forwarded-For.
// Without this, express-rate-limit throws a ValidationError on every request.
app.set('trust proxy', 1)

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet())
// Allow all origins — LMS is accessed from multiple Vercel preview URLs
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General: 300 req / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        { xForwardedForHeader: false },
  skip: (req) => req.path === '/health',  // never throttle health checks
  message: { success: false, error: 'Too many requests. Please wait and try again.' },
})

// AI endpoints: expensive calls — 30 per minute
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      30,
  validate: { xForwardedForHeader: false },
  message: { success: false, error: 'AI rate limit reached. Try again in a minute.' },
})

// Voice/call endpoints: 20 per minute
const callLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      20,
  validate: { xForwardedForHeader: false },
  message: { success: false, error: 'Too many calls in one minute.' },
})

app.use('/api',       apiLimiter)
app.use('/api/ai',    aiLimiter)
app.use('/api/calls', callLimiter)

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000')
})

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'Edunex API',
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
    memory:    Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    env: {
      twilio:   !!process.env.TWILIO_SID  && !process.env.TWILIO_SID.startsWith('your_'),
      gemini:   !!process.env.GEMINI_KEY  && !process.env.GEMINI_KEY.startsWith('your_'),
      did:      !!process.env.DID_KEY     && !process.env.DID_KEY.startsWith('your_'),
      supabase: !!process.env.SUPABASE_URL,
    },
  })
})

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/calls',     callRoutes)
app.use('/api/students',  studentRoutes)
app.use('/api/teachers',  teacherRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/fees',      feeRoutes)
app.use('/api/enquiries', enquiryRoutes)
app.use('/api/ai',        aiRoutes)
app.use('/api/agent',     agentRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/bus',       busRoutes)
app.use('/api/parents',  parentRoutes)
app.use('/api/video',    videoRoutes)
app.use('/api/courses',  courseRoutes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── HTTP server with keep-alive tuning ───────────────────────────────────────
const server = http.createServer(app)
server.keepAliveTimeout  = 65_000  // slightly above Railway/Vercel's 60 s LB timeout
server.headersTimeout    = 66_000  // must be > keepAliveTimeout

// ── Voice Agent WebSocket ─────────────────────────────────────────────────────
setupVoiceAgent(server)

server.listen(PORT, () => {
  console.log(`\n🚀 Edunex API running on http://localhost:${PORT}`)
  console.log(`   Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB heap`)
  console.log(`   Twilio:  ${!!process.env.TWILIO_SID  && !process.env.TWILIO_SID.startsWith('your_')}`)
  console.log(`   Gemini:  ${!!process.env.GEMINI_KEY  && !process.env.GEMINI_KEY.startsWith('your_')}`)
})

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// Railway sends SIGTERM before killing the container.
// We wait for in-flight requests to finish before closing (max 10 s).
function shutdown(signal: string) {
  console.log(`\n${signal} received — gracefully shutting down…`)
  server.close(() => {
    console.log('Server closed. Goodbye.')
    process.exit(0)
  })
  setTimeout(() => { console.error('Forced exit after 10s'); process.exit(1) }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

// Prevent ValidationError from express-rate-limit crashing the process
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})
