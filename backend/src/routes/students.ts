import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// GET /api/students?cls=10A&search=arjun&page=1&limit=50
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '100', 10)))
    const from  = (page - 1) * limit
    const to    = from + limit - 1

    let query = supabase
      .from('students')
      .select('id,name,cls,roll,phone,parent,parent_email,fee_status,absent,school_id', { count: 'exact' })
      .eq('school_id', req.schoolId!)
      .order('cls').order('roll')
      .range(from, to)

    if (req.query.cls)    query = query.eq('cls', req.query.cls as string)
    if (req.query.search) query = query.ilike('name', `%${req.query.search}%`)

    const { data, error, count } = await query
    if (error) throw error
    res.json({ success: true, data, meta: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch students' })
  }
})

// POST /api/students
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, cls, roll, phone, parent, parent_email } = req.body as Record<string, string>
    if (!name || !cls || !phone) {
      res.status(400).json({ success: false, error: 'Name, class, and phone are required' })
      return
    }
    const { data, error } = await supabase
      .from('students')
      .insert({ school_id: req.schoolId!, name, cls, roll: roll || '', phone, parent: parent || '', parent_email: parent_email || null, fee_status: 'pending', absent: false })
      .select()
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create student' })
  }
})

// POST /api/students/bulk — CSV import
router.post('/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const { students } = req.body as { students: Array<Record<string, string>> }
    if (!students?.length) {
      res.status(400).json({ success: false, error: 'No students provided' })
      return
    }
    const rows = students.map((s) => ({
      school_id:    req.schoolId!,
      name:         s.name || '',
      cls:          s.cls || '',
      roll:         s.roll || '',
      phone:        s.phone || '',
      parent:       s.parent || '',
      parent_email: s.parent_email || null,
      fee_status:   'pending',
      absent:       false,
    })).filter((s) => s.name && s.phone)

    const { data, error } = await supabase.from('students').insert(rows).select()
    if (error) throw error
    res.status(201).json({ success: true, data: { inserted: data?.length ?? 0 } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Bulk import failed' })
  }
})

// PATCH /api/students/:id
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update student' })
  }
})

// DELETE /api/students/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete student' })
  }
})

// PATCH /api/students/:id/attendance
router.patch('/:id/attendance', async (req: AuthRequest, res: Response) => {
  try {
    const { absent } = req.body as { absent: boolean }
    const { data, error } = await supabase
      .from('students')
      .update({ absent })
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to update student' }) }
})

export default router
