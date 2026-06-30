import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// GET /api/courses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('school_id', req.schoolId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch courses' })
  }
})

// POST /api/courses
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, cls, teacher } = req.body as Record<string, string>
    if (!title) { res.status(400).json({ success: false, error: 'Title is required' }); return }
    const { data, error } = await supabase
      .from('courses')
      .insert({ school_id: req.schoolId!, title, subject: subject || '', cls: cls || '', status: 'draft' })
      .select()
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create course' })
  }
})

// PATCH /api/courses/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update course' })
  }
})

// DELETE /api/courses/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete course' })
  }
})

export default router
