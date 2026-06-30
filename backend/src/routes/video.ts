import { Router, type Response } from 'express'
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// D-ID API helper
const DID_KEY = process.env.DID_KEY || ''
const DID_BASE = 'https://api.d-id.com'

async function didRequest(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(`${DID_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${DID_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json() }
}

// ── List videos ───────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('school_id', req.schoolId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch videos' })
  }
})

// ── Create AI avatar video (D-ID) ─────────────────────────────────────────────
router.post('/create', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, script, presenter = 'amy' } = req.body as {
      title: string
      script: string
      presenter?: string
    }

    if (!title || !script) {
      res.status(400).json({ success: false, error: 'title and script are required' })
      return
    }

    // Presenter avatar URLs (D-ID built-in presenters)
    const presenters: Record<string, string> = {
      amy:    'https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg',
      jack:   'https://create-images-results.d-id.com/api_docs/assets/joanne.jpeg',
      lily:   'https://create-images-results.d-id.com/api_docs/assets/amy.jpeg',
    }
    const sourceUrl = presenters[presenter] ?? presenters.amy

    // Call D-ID API to create a talking video
    const { status, data: didData } = await didRequest('/talks', 'POST', {
      source_url: sourceUrl,
      script: {
        type: 'text',
        input: script,
        provider: {
          type: 'microsoft',
          voice_id: 'en-US-JennyNeural',
        },
      },
      config: { fluent: true, pad_audio: 0 },
    })

    if (status !== 201 && status !== 200) {
      res.status(502).json({ success: false, error: 'D-ID API error', details: didData })
      return
    }

    const didId = (didData as Record<string, unknown>).id as string

    // Save to Supabase
    const { data: video, error } = await supabase
      .from('videos')
      .insert({
        school_id: req.schoolId!,
        title,
        script,
        presenter,
        did_id: didId,
        status: 'processing',
      })
      .select()
      .single()
    if (error) throw error

    res.status(201).json({ success: true, data: video })
  } catch (err) {
    console.error('Video create error:', err)
    res.status(500).json({ success: false, error: 'Failed to create video' })
  }
})

// ── Sync status from D-ID ─────────────────────────────────────────────────────
router.get('/status/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
      .single()
    if (error || !video) {
      res.status(404).json({ success: false, error: 'Video not found' })
      return
    }

    // If already done, return cached
    if (video.status === 'done' || video.status === 'error') {
      res.json({ success: true, data: video })
      return
    }

    // Poll D-ID for status
    const { data: didData } = await didRequest(`/talks/${video.did_id}`)
    const didStatus = (didData as Record<string, unknown>).status as string
    const resultUrl = (didData as Record<string, unknown>).result_url as string | undefined

    const updates: Record<string, unknown> = {
      status: didStatus === 'done' ? 'done' : didStatus === 'error' ? 'error' : 'processing',
    }
    if (resultUrl) updates.video_url = resultUrl

    const { data: updated } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    res.json({ success: true, data: updated ?? video })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get video status' })
  }
})

// ── Delete video ──────────────────────────────────────────────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete video' })
  }
})

export default router
