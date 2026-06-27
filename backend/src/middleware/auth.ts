import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  schoolId?: string
  userId?: string
  role?: string
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role !== 'school_admin' && req.role !== 'super_admin') {
    res.status(403).json({ success: false, error: 'Only school admins can perform this action' })
    return
  }
  next()
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      schoolId: string
      role: string
    }
    req.userId   = payload.userId
    req.schoolId = payload.schoolId
    req.role     = payload.role
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}
