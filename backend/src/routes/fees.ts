import { Router, type Response } from 'express'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// GET /api/fees — students with their fee status
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, cls, phone, fee_status')
      .eq('school_id', req.schoolId!)
      .order('cls')

    if (error) throw error

    // Join with fees table for amounts
    const studentIds = (data || []).map((s) => s.id)
    const { data: feeRows } = await supabase
      .from('fees')
      .select('*')
      .in('student_id', studentIds)
      .eq('school_id', req.schoolId!)

    const result = (data || []).map((student) => {
      const fee = feeRows?.find((f) => f.student_id === student.id)
      return {
        ...student,
        amount: fee?.amount ?? 45000,
        paid:   fee?.paid   ?? (student.fee_status === 'paid' ? 45000 : 0),
        due:    fee?.due    ?? (student.fee_status === 'paid' ? 0 : 45000),
      }
    })

    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch fees' })
  }
})

// PATCH /api/fees/:studentId/pay — mark as paid
router.patch('/:studentId/pay', async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params

    // Update student fee_status
    await supabase
      .from('students')
      .update({ fee_status: 'paid' })
      .eq('id', studentId)
      .eq('school_id', req.schoolId!)

    // Upsert fee record
    const { data: existing } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .single()

    if (existing) {
      await supabase.from('fees').update({ paid: existing.amount, due: 0, status: 'paid' }).eq('id', existing.id)
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Payment error' })
  }
})

export default router
