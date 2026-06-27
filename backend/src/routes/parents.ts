import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/parents/register
// Parent self-registers with school code + phone number
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { schoolCode, phone, name, password, studentName } = req.body as {
      schoolCode: string
      phone: string
      name: string
      password: string
      studentName?: string
    }

    if (!schoolCode || !phone || !name || !password) {
      res.status(400).json({ success: false, error: 'schoolCode, phone, name and password are required' })
      return
    }

    // Find school by code (school email prefix or id prefix)
    const { data: school, error: schoolErr } = await supabase
      .from('schools')
      .select('id, name, status')
      .or(`email.ilike.${schoolCode}%,id.eq.${schoolCode}`)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (schoolErr || !school) {
      res.status(404).json({ success: false, error: 'School not found. Check your school code.' })
      return
    }

    // Check duplicate phone in this school
    const { data: existing } = await supabase
      .from('parents')
      .select('id')
      .eq('school_id', school.id)
      .eq('phone', phone.trim())
      .maybeSingle()

    if (existing) {
      res.status(409).json({ success: false, error: 'A parent account with this phone already exists for this school.' })
      return
    }

    // Try to auto-link student by name
    let studentId: string | null = null
    if (studentName) {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', school.id)
        .ilike('name', `%${studentName.trim()}%`)
        .limit(1)
        .maybeSingle()
      if (student) studentId = student.id
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { data: parent, error: insertErr } = await supabase
      .from('parents')
      .insert({
        school_id: school.id,
        student_id: studentId,
        name: name.trim(),
        phone: phone.trim(),
        password_hash: passwordHash,
      })
      .select()
      .single()

    if (insertErr || !parent) {
      res.status(500).json({ success: false, error: 'Failed to create parent account' })
      return
    }

    const token = jwt.sign(
      { userId: parent.id, schoolId: school.id, role: 'parent', studentId },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' },
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          role: 'parent',
          school_id: school.id,
          school_name: school.name,
          student_id: studentId,
        },
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/parents/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body as { phone: string; password: string }

    if (!phone || !password) {
      res.status(400).json({ success: false, error: 'Phone and password are required' })
      return
    }

    const { data: parent, error } = await supabase
      .from('parents')
      .select('id, name, phone, school_id, student_id, password_hash, status, schools(name)')
      .eq('phone', phone.trim())
      .eq('status', 'active')
      .maybeSingle()

    if (error || !parent) {
      res.status(401).json({ success: false, error: 'Invalid phone number or password' })
      return
    }

    const valid = await bcrypt.compare(password, parent.password_hash)
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid phone number or password' })
      return
    }

    const token = jwt.sign(
      { userId: parent.id, schoolId: parent.school_id, role: 'parent', studentId: parent.student_id },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' },
    )

    const schoolName = (parent.schools as { name: string } | null)?.name ?? ''

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          role: 'parent',
          school_id: parent.school_id,
          school_name: schoolName,
          student_id: parent.student_id,
        },
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/parents/me — full child data for parent dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'parent') {
      res.status(403).json({ success: false, error: 'Parents only' })
      return
    }

    const { data: parent } = await supabase
      .from('parents')
      .select('id, name, phone, student_id')
      .eq('id', req.userId!)
      .single()

    if (!parent || !parent.student_id) {
      res.json({ success: true, data: { parent, student: null, attendance: [], fees: [], marks: [], alerts: [] } })
      return
    }

    // Fetch everything in parallel
    const [stuRes, attRes, feeRes, marksRes] = await Promise.all([
      supabase.from('students').select('id, name, class, section, roll_number, phone').eq('id', parent.student_id).single(),
      supabase.from('attendance').select('date, status').eq('student_id', parent.student_id).order('date', { ascending: false }).limit(30),
      supabase.from('fees').select('term, amount, paid, due_date, paid_date').eq('student_id', parent.student_id).order('due_date', { ascending: false }),
      supabase.from('marks').select('subject, marks_obtained, max_marks, exam_name, exam_date').eq('student_id', parent.student_id).order('exam_date', { ascending: false }).limit(20),
    ])

    // Fetch school alerts (recent announcements)
    const { data: alerts } = await supabase
      .from('announcements')
      .select('id, message, created_at')
      .eq('school_id', req.schoolId!)
      .order('created_at', { ascending: false })
      .limit(10)

    res.json({
      success: true,
      data: {
        parent: { id: parent.id, name: parent.name, phone: parent.phone },
        student: stuRes.data ?? null,
        attendance: attRes.data ?? [],
        fees: feeRes.data ?? [],
        marks: marksRes.data ?? [],
        alerts: alerts ?? [],
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch parent data' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/parents/link-student — link student to parent account
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/link-student', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'parent') {
      res.status(403).json({ success: false, error: 'Parents only' })
      return
    }

    const { studentName, rollNumber } = req.body as { studentName?: string; rollNumber?: string }

    let query = supabase.from('students').select('id, name, class').eq('school_id', req.schoolId!)
    if (rollNumber) query = query.eq('roll_number', rollNumber)
    else if (studentName) query = query.ilike('name', `%${studentName}%`)
    else {
      res.status(400).json({ success: false, error: 'Provide studentName or rollNumber' })
      return
    }

    const { data: student } = await query.limit(1).maybeSingle()
    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found in this school' })
      return
    }

    await supabase.from('parents').update({ student_id: student.id }).eq('id', req.userId!)

    res.json({ success: true, data: student })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to link student' })
  }
})

export default router
