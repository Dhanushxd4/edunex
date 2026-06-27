import { Router, type Response } from 'express'
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page as string || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '100', 10)))
    const from  = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('teachers')
      .select('id,name,subject,classes,phone,email,status,school_id', { count: 'exact' })
      .eq('school_id', req.schoolId!)
      .order('name')
      .range(from, from + limit - 1)
    if (error) throw error
    res.json({ success: true, data, meta: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) } })
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch teachers' }) }
})

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, classes, phone, email } = req.body as Record<string, string>
    if (!name) { res.status(400).json({ success: false, error: 'Name is required' }); return }
    const { data, error } = await supabase
      .from('teachers')
      .insert({ school_id: req.schoolId!, name, subject: subject || '', classes: classes || [], phone: phone || '', email: email || null, status: 'active' })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to create teacher' }) }
})

router.patch('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Whitelist updatable fields — prevents overwriting school_id or id
    const { name, subject, classes, phone, email, status } = req.body as Record<string, unknown>
    const updates: Record<string, unknown> = {}
    if (name     !== undefined) updates.name     = name
    if (subject  !== undefined) updates.subject  = subject
    if (classes  !== undefined) updates.classes  = classes
    if (phone    !== undefined) updates.phone    = phone
    if (email    !== undefined) updates.email    = email
    if (status   !== undefined) updates.status   = status
    const { data, error } = await supabase
      .from('teachers').update(updates).eq('id', req.params.id).eq('school_id', req.schoolId!).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to update teacher' }) }
})

router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase.from('teachers').delete().eq('id', req.params.id).eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true })
  } catch { res.status(500).json({ success: false, error: 'Failed to delete teacher' }) }
})

export default router
