import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string }

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' })
      return
    }

    // Super admin shortcut
    if (
      email === 'superadmin@edunex.in' &&
      (password === process.env.SUPER_ADMIN_PASSWORD || password === 'Edunex@2024')
    ) {
      const token = jwt.sign(
        { userId: 'super-admin', schoolId: null, role: 'super_admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' },
      )
      res.json({
        success: true,
        data: {
          token,
          user: {
            id: 'super-admin',
            email,
            role: 'super_admin',
            name: 'Super Admin',
          },
        },
      })
      return
    }

    // School admin login
    const { data: school, error } = await supabase
      .from('schools')
      .select('id, name, email, password_hash, principal, plan, status')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !school) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    if (school.status === 'inactive') {
      res.status(403).json({ success: false, error: 'School account is inactive. Contact Edunex support.' })
      return
    }

    const valid = await bcrypt.compare(password, school.password_hash)
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' })
      return
    }

    const token = jwt.sign(
      { userId: school.id, schoolId: school.id, role: 'school_admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: school.id,
          email: school.email,
          role: 'school_admin',
          name: school.principal,
          school_id: school.id,
          school_name: school.name,
          school_plan: school.plan,
        },
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      schoolName, email, phone, city, state, board, medium,
      principalName, password, studentCount, plan,
    } = req.body as Record<string, string>

    if (!schoolName || !email || !password || !principalName) {
      res.status(400).json({ success: false, error: 'Missing required fields' })
      return
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('schools')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const { data: school, error } = await supabase
      .from('schools')
      .insert({
        name: schoolName,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        principal: principalName,
        phone: phone || '',
        city: city || '',
        state: state || 'Telangana',
        board: board || 'CBSE',
        medium: medium || 'English',
        plan: (plan as 'starter' | 'professional' | 'elite') || 'starter',
        status: 'trial',
        student_count: parseInt(studentCount) || 500,
        call_duration: 60,
        twilio_number: null,
        joined: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !school) {
      res.status(500).json({ success: false, error: 'Failed to create school account' })
      return
    }

    const token = jwt.sign(
      { userId: school.id, schoolId: school.id, role: 'school_admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: school.id,
          email: school.email,
          role: 'school_admin',
          name: school.principal,
          school_id: school.id,
          school_name: school.name,
          school_plan: school.plan,
        },
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' })
  }
})

export default router
