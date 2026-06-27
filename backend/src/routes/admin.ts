import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// Only super_admin can access these routes
function requireSuperAdmin(req: AuthRequest, res: Response, next: () => void) {
  if (req.role !== 'super_admin') {
    res.status(403).json({ success: false, error: 'Super admin access required' })
    return
  }
  next()
}

// GET /api/admin/schools — list all schools
router.get('/schools', requireSuperAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, email, principal, city, state, plan, status, twilio_number')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch schools' }) }
})

// PATCH /api/admin/schools/:id — update plan/status
router.patch('/schools/:id', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['plan', 'status', 'twilio_number']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }
    const { data, error } = await supabase
      .from('schools').update(updates).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch { res.status(500).json({ success: false, error: 'Failed to update school' }) }
})

export default router
