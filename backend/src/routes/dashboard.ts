import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'
import { cached } from '../lib/cache'

const router = Router()
router.use(requireAuth)

// GET /api/dashboard — all KPI stats in one call
// Cached for 30 s per school — a busy school hitting refresh 100x/min
// only causes 2 Supabase reads instead of 100.
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const sid  = req.schoolId!
    const cKey = `dashboard:${sid}`

    const data = await cached(cKey, 30_000, async () => {
      const [
        { count: totalStudents },
        { count: absentToday },
        { count: pendingFees },
        { count: callsToday },
        { data: recentCalls },
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', sid),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', sid).eq('absent', true),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', sid).in('fee_status', ['pending', 'overdue']),
        supabase.from('calls').select('id', { count: 'exact', head: true }).eq('school_id', sid).gte('called_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.from('calls').select('id,student_name,phone,status,called_at').eq('school_id', sid).order('called_at', { ascending: false }).limit(10),
      ])

      return {
        totalStudents: totalStudents ?? 0,
        absentToday:   absentToday   ?? 0,
        pendingFees:   pendingFees   ?? 0,
        callsToday:    callsToday    ?? 0,
        recentCalls:   recentCalls   ?? [],
      }
    })

    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to load dashboard data' })
  }
})

export default router
