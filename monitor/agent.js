/**
 * EDUNEX AUTONOMOUS MONITORING AGENT
 * Watches everything 24/7 — detects issues, auto-fixes what it can,
 * reports everything to a live status file read by the dashboard.
 */

import http   from 'http'
import https  from 'https'
import fs     from 'fs'
import path   from 'path'
import { exec, spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const FRONTEND  = path.join(ROOT, 'frontend')
const BACKEND   = path.join(ROOT, 'backend')
const STATUS_FILE = path.join(ROOT, 'monitor', 'status.json')

// ── ANSI colors (no chalk needed) ────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  bold:   '\x1b[1m',
}

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  startedAt:  new Date().toISOString(),
  lastCheck:  null,
  checksRun:  0,
  fixesApplied: 0,
  services: {
    frontend: { status: 'unknown', latencyMs: null, lastChecked: null, error: null },
    backend:  { status: 'unknown', latencyMs: null, lastChecked: null, error: null },
    supabase: { status: 'unknown', latencyMs: null, lastChecked: null, error: null },
    twilio:   { status: 'unknown', lastChecked: null, error: null },
    gemini:   { status: 'unknown', lastChecked: null, error: null },
  },
  build: {
    lastStatus: 'unknown',
    errors: [],
    lastRun: null,
  },
  issues: [],
  fixes:  [],
  logs:   [],
}

// ── Logging ───────────────────────────────────────────────────────────────────
function log(level, msg, detail = '') {
  const ts = new Date().toLocaleTimeString('en-IN')
  const colors = { INFO: C.cyan, WARN: C.yellow, ERROR: C.red, FIX: C.green, OK: C.green }
  const color  = colors[level] || C.white
  console.log(`${color}[${ts}] [${level}]${C.reset} ${msg}${detail ? ` — ${detail}` : ''}`)

  state.logs.unshift({ time: new Date().toISOString(), level, msg, detail })
  if (state.logs.length > 100) state.logs.pop()
}

// ── HTTP probe ────────────────────────────────────────────────────────────────
function probe(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const start = Date.now()
    const lib   = url.startsWith('https') ? https : http
    const req   = lib.get(url, { timeout: timeoutMs }, (res) => {
      resolve({ ok: res.statusCode < 500, status: res.statusCode, latencyMs: Date.now() - start })
    })
    req.on('error', (err) => resolve({ ok: false, status: 0, latencyMs: Date.now() - start, error: err.message }))
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, latencyMs: timeoutMs, error: 'timeout' }) })
  })
}

// ── Check frontend (port 3000) ────────────────────────────────────────────────
async function checkFrontend() {
  const r = await probe('http://localhost:3000')
  const now = new Date().toISOString()
  if (r.ok) {
    state.services.frontend = { status: 'healthy', latencyMs: r.latencyMs, lastChecked: now, error: null }
    log('OK', 'Frontend healthy', `${r.latencyMs}ms`)
  } else {
    state.services.frontend = { status: 'down', latencyMs: r.latencyMs, lastChecked: now, error: r.error || `HTTP ${r.status}` }
    log('ERROR', 'Frontend is DOWN', r.error || `HTTP ${r.status}`)
    await fixFrontend()
  }
}

// ── Check backend (port 4000) ─────────────────────────────────────────────────
async function checkBackend() {
  const r = await probe('http://localhost:4000/health')
  const now = new Date().toISOString()
  if (r.ok) {
    state.services.backend = { status: 'healthy', latencyMs: r.latencyMs, lastChecked: now, error: null }
    log('OK', 'Backend healthy', `${r.latencyMs}ms`)
  } else {
    state.services.backend = { status: 'down', latencyMs: r.latencyMs, lastChecked: now, error: r.error || `HTTP ${r.status}` }
    log('ERROR', 'Backend is DOWN', r.error || `HTTP ${r.status}`)
    await fixBackend()
  }
}

// ── Check Supabase ────────────────────────────────────────────────────────────
async function checkSupabase() {
  const envPath = path.join(BACKEND, '.env')
  const now = new Date().toISOString()
  try {
    const env = fs.readFileSync(envPath, 'utf8')
    const url = env.match(/SUPABASE_URL=(.+)/)?.[1]?.trim()
    if (!url || url === 'your-project.supabase.co') {
      state.services.supabase = { status: 'not_configured', lastChecked: now, error: 'SUPABASE_URL not set' }
      addIssue('supabase_url_missing', 'Supabase URL not configured in backend/.env', 'warning')
      return
    }
    const r = await probe(`${url}/rest/v1/`, 5000)
    if (r.status === 401 || r.status === 200 || r.status === 404) {
      // 401 means Supabase responded (auth required) — that's fine
      state.services.supabase = { status: 'healthy', latencyMs: r.latencyMs, lastChecked: now, error: null }
      log('OK', 'Supabase reachable', `${r.latencyMs}ms`)
    } else {
      state.services.supabase = { status: 'error', latencyMs: r.latencyMs, lastChecked: now, error: `HTTP ${r.status}` }
      log('WARN', 'Supabase unexpected response', `HTTP ${r.status}`)
    }
  } catch (err) {
    state.services.supabase = { status: 'error', lastChecked: now, error: err.message }
  }
}

// ── Check API credentials ──────────────────────────────────────────────────────
async function checkCredentials() {
  const envPath = path.join(BACKEND, '.env')
  const now = new Date().toISOString()
  try {
    const env = fs.readFileSync(envPath, 'utf8')
    const get = (key) => env.match(new RegExp(`^${key}=(.+)`, 'm'))?.[1]?.trim()

    // Twilio
    const sid   = get('TWILIO_SID')
    const token = get('TWILIO_TOKEN')
    const hasRealSid = sid && sid !== 'your_twilio_account_sid' && /^AC[a-f0-9]{32}$/.test(sid)
    if (!hasRealSid) {
      state.services.twilio = { status: 'not_configured', lastChecked: now, error: 'Real Twilio SID not set (must be AC + 32 hex chars)' }
      addIssue('twilio_sid_invalid', 'Twilio Account SID is missing or fake — calls will not work', 'error',
        'Go to twilio.com/console → copy your real Account SID → paste it in backend/.env as TWILIO_SID')
    } else {
      state.services.twilio = { status: 'configured', lastChecked: now, error: null }
      log('OK', 'Twilio SID configured')
    }

    // Gemini
    const gemini = get('GEMINI_KEY')
    if (!gemini || gemini === 'your_gemini_api_key') {
      state.services.gemini = { status: 'not_configured', lastChecked: now, error: 'GEMINI_KEY not set' }
      addIssue('gemini_key_missing', 'Gemini API key not set — AI Exam Generator will use fallback questions', 'warning',
        'Go to aistudio.google.com → Get API key → paste in backend/.env as GEMINI_KEY')
    } else {
      state.services.gemini = { status: 'configured', lastChecked: now, error: null }
      log('OK', 'Gemini key configured')
    }
  } catch (err) {
    log('ERROR', 'Cannot read backend/.env', err.message)
    addIssue('env_file_missing', 'backend/.env file is missing or unreadable', 'error',
      'Create backend/.env from backend/.env.example and fill in your credentials')
  }
}

// ── Run TypeScript build check ─────────────────────────────────────────────────
function runBuildCheck() {
  return new Promise((resolve) => {
    log('INFO', 'Running TypeScript build check...')
    state.build.lastRun = new Date().toISOString()
    exec('node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run build', { cwd: FRONTEND, timeout: 120000 }, (err, stdout, stderr) => {
      const output = (stdout + stderr)
      const tsErrors = output.match(/error TS\d+:?.+/g) || []
      if (!err && tsErrors.length === 0) {
        state.build = { lastStatus: 'passing', errors: [], lastRun: new Date().toISOString() }
        log('OK', `TypeScript build passing`)
        clearIssue('ts_build_error')
      } else {
        state.build = { lastStatus: 'failing', errors: tsErrors.slice(0, 20), lastRun: new Date().toISOString() }
        log('ERROR', `Build has ${tsErrors.length} TypeScript errors`)
        addIssue('ts_build_error', `TypeScript build failing — ${tsErrors.length} errors`, 'error',
          tsErrors.slice(0, 3).join('\n'))
        autoFixTsErrors(tsErrors)
      }
      resolve()
    })
  })
}

// ── Auto-fix TypeScript errors ────────────────────────────────────────────────
function autoFixTsErrors(errors) {
  let fixCount = 0
  for (const err of errors) {
    // Fix: unused import (TS6133)
    if (err.includes('TS6133') && err.includes('is declared but its value is never read')) {
      const fileMatch   = err.match(/^(.+\.tsx?)\(/)
      const importMatch = err.match(/'(.+)' is declared/)
      if (fileMatch && importMatch) {
        const filePath   = fileMatch[1]
        const importName = importMatch[1]
        try {
          let src = fs.readFileSync(filePath, 'utf8')
          // Remove from import list: ", BadImport" or "BadImport, "
          const before = src
          src = src.replace(new RegExp(`,\\s*${importName}\\b`, 'g'), '')
          src = src.replace(new RegExp(`\\b${importName}\\s*,\\s*`, 'g'), '')
          // If import is now empty { } remove entire line
          src = src.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '')
          if (src !== before) {
            fs.writeFileSync(filePath, src)
            applyFix(`Auto-removed unused import '${importName}' from ${path.basename(filePath)}`)
            fixCount++
          }
        } catch {}
      }
    }
  }
  if (fixCount > 0) log('FIX', `Auto-fixed ${fixCount} TypeScript errors`)
}

// ── Fix: restart frontend ─────────────────────────────────────────────────────
let frontendProc = null
function fixFrontend() {
  return new Promise((resolve) => {
    log('FIX', 'Attempting to restart Vite dev server...')
    if (frontendProc) { try { frontendProc.kill() } catch {} }

    frontendProc = spawn(
      'node',
      ['"C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"', 'run', 'dev'],
      { cwd: FRONTEND, shell: true, stdio: 'pipe' }
    )
    frontendProc.on('error', (err) => log('ERROR', 'Cannot restart frontend', err.message))

    setTimeout(async () => {
      const r = await probe('http://localhost:3000')
      if (r.ok) {
        applyFix('Auto-restarted Vite dev server (frontend was down)')
        state.services.frontend.status = 'healthy'
        clearIssue('frontend_down')
      } else {
        addIssue('frontend_down', 'Frontend (port 3000) is not responding — start it manually', 'error',
          'Open a terminal: cd edunex/frontend && npm run dev')
      }
      resolve()
    }, 6000)
  })
}

// ── Fix: restart backend ──────────────────────────────────────────────────────
let backendProc = null
function fixBackend() {
  return new Promise((resolve) => {
    log('FIX', 'Attempting to restart Express backend...')
    if (backendProc) { try { backendProc.kill() } catch {} }

    backendProc = spawn(
      'node',
      ['"C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"', 'run', 'dev'],
      { cwd: BACKEND, shell: true, stdio: 'pipe' }
    )
    backendProc.on('error', (err) => log('ERROR', 'Cannot restart backend', err.message))

    setTimeout(async () => {
      const r = await probe('http://localhost:4000/health')
      if (r.ok) {
        applyFix('Auto-restarted Express backend (was down)')
        state.services.backend.status = 'healthy'
        clearIssue('backend_down')
      } else {
        addIssue('backend_down', 'Backend (port 4000) is not responding — start it manually', 'error',
          'Open a terminal: cd edunex/backend && npm run dev')
      }
      resolve()
    }, 6000)
  })
}

// ── Issues management ─────────────────────────────────────────────────────────
function addIssue(id, message, severity = 'error', fix = '') {
  const existing = state.issues.find((i) => i.id === id)
  if (!existing) {
    state.issues.unshift({ id, message, severity, fix, detectedAt: new Date().toISOString(), autoFixed: false })
  }
}

function clearIssue(id) {
  state.issues = state.issues.filter((i) => i.id !== id)
}

function applyFix(description) {
  state.fixesApplied++
  state.fixes.unshift({ description, appliedAt: new Date().toISOString() })
  if (state.fixes.length > 50) state.fixes.pop()
  log('FIX', description)
}

// ── Watch source files for errors ─────────────────────────────────────────────
let buildCheckTimer = null
function scheduleRebuildCheck() {
  if (buildCheckTimer) clearTimeout(buildCheckTimer)
  buildCheckTimer = setTimeout(() => runBuildCheck(), 5000)
}

function watchFiles() {
  const srcDir = path.join(FRONTEND, 'src')
  if (!fs.existsSync(srcDir)) return

  let watcher
  try {
    // Simple polling watcher
    let lastMtime = {}
    setInterval(() => {
      function scanDir(dir) {
        try {
          for (const f of fs.readdirSync(dir)) {
            const full = path.join(dir, f)
            try {
              const stat = fs.statSync(full)
              if (stat.isDirectory()) { scanDir(full); continue }
              if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue
              const mtime = stat.mtimeMs
              if (lastMtime[full] && lastMtime[full] !== mtime) {
                log('INFO', `File changed: ${f}`)
                scheduleRebuildCheck()
              }
              lastMtime[full] = mtime
            } catch {}
          }
        } catch {}
      }
      scanDir(srcDir)
    }, 2000)
    log('INFO', 'Watching src/ for file changes')
  } catch (err) {
    log('WARN', 'File watcher failed', err.message)
  }
}

// ── Check missing env variables ───────────────────────────────────────────────
function checkEnvCompleteness() {
  const required = {
    backend: {
      file: path.join(BACKEND, '.env'),
      keys: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET', 'TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_NUMBER', 'GEMINI_KEY'],
      placeholders: ['your_twilio_account_sid', 'your_gemini_api_key', 'your_supabase_service_role_key_here', 'your_did_api_key_base64'],
    },
    frontend: {
      file: path.join(FRONTEND, '.env'),
      keys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
      placeholders: [],
    },
  }

  for (const [env, cfg] of Object.entries(required)) {
    try {
      const content = fs.readFileSync(cfg.file, 'utf8')
      for (const key of cfg.keys) {
        const val = content.match(new RegExp(`^${key}=(.+)`, 'm'))?.[1]?.trim()
        const isPlaceholder = !val || cfg.placeholders.some((p) => val.includes(p))
        if (isPlaceholder) {
          const issueId = `missing_${key.toLowerCase()}`
          const friendly = key.replace(/_/g, ' ').toLowerCase()
          addIssue(issueId, `${friendly} not configured in ${env}/.env`, 'warning',
            `Add ${key}=your_real_value to ${env}/.env`)
        } else {
          clearIssue(`missing_${key.toLowerCase()}`)
        }
      }
    } catch {}
  }
}

// ── Save status to file (read by dashboard) ───────────────────────────────────
function saveStatus() {
  state.lastCheck = new Date().toISOString()
  const openIssues  = state.issues.filter((i) => !i.autoFixed)
  const criticalCnt = openIssues.filter((i) => i.severity === 'error').length
  const warnCnt     = openIssues.filter((i) => i.severity === 'warning').length

  const payload = {
    ...state,
    summary: {
      overallHealth: criticalCnt === 0 ? (warnCnt === 0 ? 'healthy' : 'degraded') : 'critical',
      openIssues:    openIssues.length,
      criticalCount: criticalCnt,
      warningCount:  warnCnt,
      fixesApplied:  state.fixesApplied,
    },
  }

  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(payload, null, 2))
  } catch (err) {
    log('WARN', 'Cannot write status.json', err.message)
  }
}

// ── Main check cycle ──────────────────────────────────────────────────────────
async function runChecks() {
  state.checksRun++
  log('INFO', `═══ Check #${state.checksRun} ═══`)

  await Promise.allSettled([
    checkFrontend(),
    checkBackend(),
    checkSupabase(),
    checkCredentials(),
  ])

  checkEnvCompleteness()
  saveStatus()
  printSummary()
}

function printSummary() {
  const s = state.services
  const icon = (status) => ({ healthy: '✅', down: '❌', error: '❌', not_configured: '⚠️', configured: '✅', unknown: '❓' }[status] || '❓')
  console.log(`\n${C.bold}── System Status ──────────────────────────${C.reset}`)
  console.log(` ${icon(s.frontend.status)} Frontend  ${s.frontend.latencyMs ? s.frontend.latencyMs + 'ms' : ''}`)
  console.log(` ${icon(s.backend.status)}  Backend   ${s.backend.latencyMs ? s.backend.latencyMs + 'ms' : ''}`)
  console.log(` ${icon(s.supabase.status)} Supabase  ${s.supabase.latencyMs ? s.supabase.latencyMs + 'ms' : ''}`)
  console.log(` ${icon(s.twilio.status)}  Twilio    ${s.twilio.error || 'OK'}`)
  console.log(` ${icon(s.gemini.status)}  Gemini    ${s.gemini.error || 'OK'}`)
  const issues = state.issues.filter((i) => !i.autoFixed)
  if (issues.length) {
    console.log(`\n${C.yellow}── Issues (${issues.length}) ───────────────────────────${C.reset}`)
    issues.forEach((i) => console.log(` ${i.severity === 'error' ? C.red : C.yellow}● ${i.message}${C.reset}`))
  } else {
    console.log(`\n${C.green}── All systems operational ✓${C.reset}`)
  }
  console.log(`${C.bold}───────────────────────────────────────────${C.reset}\n`)
}

// ── HTTP server to serve status.json to the dashboard ────────────────────────
function startStatusServer() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'application/json')

    if (req.url === '/status') {
      try {
        res.end(fs.readFileSync(STATUS_FILE, 'utf8'))
      } catch {
        res.end(JSON.stringify({ error: 'Status not yet available' }))
      }
    } else if (req.url === '/trigger-check') {
      runChecks()
      res.end(JSON.stringify({ ok: true, message: 'Check triggered' }))
    } else if (req.url === '/trigger-build') {
      runBuildCheck()
      res.end(JSON.stringify({ ok: true, message: 'Build check triggered' }))
    } else {
      res.end(JSON.stringify({ agent: 'Edunex Monitor', version: '1.0' }))
    }
  })

  server.listen(5000, () => log('INFO', 'Monitor agent serving status on http://localhost:5000/status'))
}

// ── Boot ──────────────────────────────────────────────────────────────────────
console.log(`${C.bold}${C.cyan}
╔══════════════════════════════════════════════════╗
║       EDUNEX AUTONOMOUS MONITORING AGENT         ║
║       Watching everything 24/7                   ║
╚══════════════════════════════════════════════════╝${C.reset}
`)

startStatusServer()
watchFiles()

// Initial check immediately
runChecks()

// Build check on start
setTimeout(() => runBuildCheck(), 3000)

// Check every 30 seconds
setInterval(runChecks, 30_000)

// Full build check every 5 minutes
setInterval(runBuildCheck, 5 * 60_000)

log('INFO', 'Agent started — checking every 30 seconds')
log('INFO', `Dashboard: http://localhost:3000/monitoring`)
log('INFO', `Status API: http://localhost:5000/status`)
