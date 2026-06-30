import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('enquiries').select('*').eq('school_id', req.schoolId!).order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch enquiries' }) }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, cls, source } = req.body as Record<string, string>
    if (!name || !phone) { res.status(400).json({ success: false, error: 'Name and phone required' }); return }
    const { data, error } = await supabase
      .from('enquiries')
      .insert({ school_id: req.schoolId!, name, phone, cls: cls || '', source: source || 'phone', status: 'new' })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to create enquiry' }) }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('enquiries').update(req.body).eq('id', req.params.id).eq('school_id', req.schoolId!).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to update enquiry' }) }
})

// POST /api/enquiries/public/:schoolId — public form (no auth)
router.post('/public/:schoolId', async (req: AuthRequest, res: Response) => {
  try {
    const { schoolId } = req.params
    const { child_name, parent_name, phone, email, class_applied, dob, current_school, source } = req.body as Record<string, string>
    if (!child_name || !phone) { res.status(400).json({ success: false, error: 'Child name and phone required' }); return }
    const { data, error } = await supabase
      .from('admissions')
      .insert({ school_id: schoolId, child_name, parent_name: parent_name || '', phone, email: email || null, class_applied: class_applied || '', dob: dob || null, current_school: current_school || null, source: source || null, status: 'pending' })
      .select().single()
    if (error) throw error
    // Also add to enquiries
    await supabase.from('enquiries').insert({ school_id: schoolId, name: `${child_name} (${parent_name})`, phone, cls: class_applied || '', source: 'online', status: 'new' })
    res.status(201).json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed tosubmit enquiry' }) }
})

export default router
