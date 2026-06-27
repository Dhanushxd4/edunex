import { Router, type Response } from 'express'
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(requireAuth)

// ── Routes (bus routes list) ──────────────────────────────────────────────────

// GET /api/bus/routes
router.get('/routes', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .eq('school_id', req.schoolId!)
      .order('number')
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch routes' })
  }
})

// POST /api/bus/routes — create route (admin only)
router.post('/routes', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { number, driver, driver_phone, stops } = req.body as {
      number: string; driver: string; driver_phone: string; stops: string[]
    }
    if (!number || !driver) {
      res.status(400).json({ success: false, error: 'Route number and driver are required' })
      return
    }
    const { data, error } = await supabase
      .from('bus_routes')
      .insert({ school_id: req.schoolId!, number, driver, driver_phone, stops: stops ?? [], status: 'active' })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to create route' })
  }
})

// PATCH /api/bus/routes/:id
router.patch('/routes/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['number', 'driver', 'driver_phone', 'stops', 'status', 'maps_link']
    const updates: Record<string, unknown> = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const { data, error } = await supabase
      .from('bus_routes')
      .update(updates)
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
      .select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update route' })
  }
})

// DELETE /api/bus/routes/:id
router.delete('/routes/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('bus_routes')
      .delete()
      .eq('id', req.params.id)
      .eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to delete route' })
  }
})

// ── Live Location ─────────────────────────────────────────────────────────────

// POST /api/bus/location — driver sends GPS position
router.post('/location', async (req: AuthRequest, res: Response) => {
  try {
    const { route_id, lat, lng, speed } = req.body as {
      route_id: string; lat: number; lng: number; speed?: number
    }
    if (!route_id || lat === undefined || lng === undefined) {
      res.status(400).json({ success: false, error: 'route_id, lat, lng required' })
      return
    }

    // Upsert location (one row per route)
    const { error } = await supabase
      .from('bus_locations')
      .upsert({
        route_id,
        school_id: req.schoolId!,
        lat,
        lng,
        speed: speed ?? 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'route_id' })
    if (error) throw error
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to update location' })
  }
})

// GET /api/bus/location/:routeId — parents/admin poll location
router.get('/location/:routeId', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bus_locations')
      .select('*')
      .eq('route_id', req.params.routeId)
      .eq('school_id', req.schoolId!)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    res.json({ success: true, data: data ?? null })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get location' })
  }
})

// GET /api/bus/locations — all active route locations for admin map view
router.get('/locations', async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('bus_locations')
      .select('*, bus_routes(number, driver)')
      .eq('school_id', req.schoolId!)
    if (error) throw error
    res.json({ success: true, data: data ?? [] })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to get locations' })
  }
})

export default router
