import { createClient } from '@supabase/supabase-js'
// Polyfill WebSocket for Node.js < 22
if (typeof globalThis.WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  globalThis.WebSocket = require('ws')
}

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_KEY!

export const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
})
