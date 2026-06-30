import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bus, MapPin, Plus, Phone, Navigation, Wifi, WifiOff, Trash2, Edit2, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

interface BusRoute {
  id: string
  number: string
  driver: string
  driver_phone: string
  stops: string[]
  status: 'active' | 'inactive'
  maps_link?: string
}

interface BusLocation {
  route_id: string
  lat: number
  lng: number
  speed: number
  updated_at: string
}

// Live map using Leaflet + OpenStreetMap (100% free, no API key)
function LiveMap({ locations, routes }: { locations: BusLocation[]; routes: BusRoute[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapReady = useRef(false)
  const markersRef = useRef<Map<string, { setLatLng: (l: [number, number]) => void }>>(new Map())

  useEffect(() => {
    if (!mapRef.current || mapReady.current) return
    mapReady.current = true

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L
      if (!mapRef.current) return
      const map = L.map(mapRef.current, { center: [17.385, 78.4867], zoom: 12 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
      ;(mapRef.current as any)._leafletMap = map
    }
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L
    const map = (mapRef.current as any)?._leafletMap
    if (!L || !map) return

    locations.forEach(loc => {
      const route = routes.find(r => r.id === loc.route_id)
      const label = route?.number ?? 'Bus'
      const existing = markersRef.current.get(loc.route_id)
      if (existing) {
        existing.setLatLng([loc.lat, loc.lng])
      } else {
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#f59e0b;color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🚌 ${label}</div>`,
        })
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map)
        marker.bindPopup(`${label} · Driver: ${route?.driver ?? ''}`)
        markersRef.current.set(loc.route_id, marker)
      }
    })
  }, [locations, routes])

  return <div ref={mapRef} className="w-full rounded-xl overflow-hidden border border-black/8" style={{ height: 340 }} />
}

export function BusPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const [tracking, setTracking] = useState(false)
  const [trackingRouteId, setTrackingRouteId] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ number: '', driver: '', driver_phone: '', stops: '' })
  const watchIdRef = useRef<number | null>(null)

  const { data: routesData } = useQuery({
    queryKey: ['bus-routes'],
    queryFn: () => api.get('/bus/routes').then((r: { data: unknown }) => r.data),
    refetchInterval: 30_000,
  })
  const routes: BusRoute[] = (routesData as { data?: BusRoute[] })?.data ?? []

  const { data: locsData } = useQuery({
    queryKey: ['bus-locations'],
    queryFn: () => api.get('/bus/locations').then((r: { data: unknown }) => r.data),
    refetchInterval: 10_000,
  })
  const locations: BusLocation[] = (locsData as { data?: BusLocation[] })?.data ?? []

  const createRoute = useMutation({
    mutationFn: (body: unknown) => api.post('/bus/routes', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bus-routes'] })
      setShowAdd(false)
      setForm({ number: '', driver: '', driver_phone: '', stops: '' })
      toast.success('Route added')
    },
  })

  const deleteRoute = useMutation({
    mutationFn: (id: string) => api.delete(`/bus/routes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bus-routes'] }); toast.success('Route deleted') },
  })

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/bus/routes/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bus-routes'] }),
  })

  const sendLocation = useCallback((routeId: string, lat: number, lng: number, speed: number) => {
    api.post('/bus/location', { route_id: routeId, lat, lng, speed }).catch(() => {})
  }, [])

  function startTracking(routeId: string) {
    if (!navigator.geolocation) { toast.error('GPS not available', 'Your browser does not support GPS'); return }
    setTrackingRouteId(routeId)
    setTracking(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => sendLocation(routeId, pos.coords.latitude, pos.coords.longitude, pos.coords.speed ?? 0),
      () => toast.error('GPS error', 'Cannot read location — check permissions'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    )
    toast.success('Tracking started', 'Live location is now broadcasting to school')
  }

  function stopTracking() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    setTracking(false)
    setTrackingRouteId('')
    toast.success('Tracking stopped')
  }

  useEffect(() => () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current) }, [])

  const hour = new Date().getHours()
  const isActiveWindow = (hour >= 7 && hour < 9) || (hour >= 16 && hour < 18)

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Status banner */}
      <Card className={`flex items-center gap-3 ${isActiveWindow ? 'border-2 border-success/30 bg-success/5' : 'border-2 border-black/8'}`}>
        <div className={`p-2.5 rounded-btn ${isActiveWindow ? 'bg-success/10' : 'bg-cream-300'}`}>
          <Bus className={`h-5 w-5 ${isActiveWindow ? 'text-success' : 'text-ink-3'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-0">Active Windows: 7–8:30 AM &amp; 4:30–6 PM</p>
          <p className={`text-xs mt-0.5 ${isActiveWindow ? 'text-success' : 'text-ink-3'}`}>
            {isActiveWindow ? '● Tracking active' : '● Outside tracking window'}
          </p>
        </div>
        {tracking && (
          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
            <Wifi className="h-3.5 w-3.5 animate-pulse" /> Broadcasting live
          </div>
        )}
      </Card>

      {/* Live Map — shows when any bus is broadcasting */}
      {locations.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-ink-0 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Live Map — {locations.length} bus{locations.length !== 1 ? 'es' : ''} on road
          </p>
          <LiveMap locations={locations} routes={routes} />
        </Card>
      )}

      {/* Header + Add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-ink-0">Bus Routes ({routes.length})</h2>
        {isAdmin && (
          <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAdd(!showAdd)}>
            Add Route
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <Card>
          <p className="text-sm font-semibold text-ink-0 mb-3">New Bus Route</p>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Route number (e.g. Route 1)" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} />
            <Input placeholder="Driver name" value={form.driver} onChange={e => setForm(p => ({ ...p, driver: e.target.value }))} />
            <Input placeholder="Driver phone" value={form.driver_phone} onChange={e => setForm(p => ({ ...p, driver_phone: e.target.value }))} />
            <Input placeholder="Stops (comma separated)" value={form.stops} onChange={e => setForm(p => ({ ...p, stops: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" leftIcon={<Check className="h-3.5 w-3.5" />}
              loading={createRoute.isPending}
              onClick={() => createRoute.mutate({ ...form, stops: form.stops.split(',').map(s => s.trim()).filter(Boolean) })}>
              Save Route
            </Button>
            <Button size="sm" variant="ghost" leftIcon={<X className="h-3.5 w-3.5" />} onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Routes */}
      <div className="space-y-3">
        {routes.length === 0 && (
          <Card className="text-center py-8">
            <Bus className="h-8 w-8 text-ink-4 mx-auto mb-2" />
            <p className="text-sm text-ink-3">No bus routes yet.</p>
            {isAdmin && <p className="text-xs text-ink-4 mt-1">Click "Add Route" to get started.</p>}
          </Card>
        )}

        {routes.map((route, i) => {
          const loc = locations.find(l => l.route_id === route.id)
          const isThisTracking = tracking && trackingRouteId === route.id
          const minsAgo = loc ? Math.floor((Date.now() - new Date(loc.updated_at).getTime()) / 60000) : null

          return (
            <motion.div key={route.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-ink-0">{route.number}</h3>
                      <Badge variant={route.status === 'active' ? 'green' : 'gray'} dot>
                        {route.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      {loc && (
                        <Badge variant="blue" dot>
                          Live {minsAgo !== null && minsAgo < 2 ? '(now)' : `(${minsAgo}m ago)`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-3 mt-0.5">
                      Driver: {route.driver} ·{' '}
                      <a href={`tel:${route.driver_phone}`} className="text-primary hover:underline">{route.driver_phone}</a>
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"
                        onClick={() => toggleStatus.mutate({ id: route.id, status: route.status === 'active' ? 'inactive' : 'active' })}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this route?')) deleteRoute.mutate(route.id) }}>
                        <Trash2 className="h-3.5 w-3.5 text-danger" />
                      </Button>
                    </div>
                  )}
                </div>

                {route.stops.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {route.stops.map((stop, j) => (
                      <div key={stop} className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-cream-300 rounded-full text-xs text-ink-2">{stop}</span>
                        {j < route.stops.length - 1 && <span className="text-ink-4 text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                )}

                {loc && (
                  <div className="bg-blue-50 rounded-lg p-2.5 mb-3 flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-blue-700">
                      {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                      {loc.speed > 0 && ` · ${Math.round(loc.speed * 3.6)} km/h`}
                    </span>
                    <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="ml-auto text-blue-600 hover:underline">
                      Open Maps ↗
                    </a>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isThisTracking ? (
                    <Button size="sm" variant="outline"
                      leftIcon={<Navigation className="h-3.5 w-3.5" />}
                      onClick={() => startTracking(route.id)}
                      disabled={tracking && trackingRouteId !== route.id}>
                      Start GPS Tracking
                    </Button>
                  ) : (
                    <Button size="sm" variant="danger" leftIcon={<WifiOff className="h-3.5 w-3.5" />} onClick={stopTracking}>
                      Stop Tracking
                    </Button>
                  )}
                  <a href={`tel:${route.driver_phone}`}>
                    <Button size="sm" variant="ghost" leftIcon={<Phone className="h-3.5 w-3.5" />}>Call Driver</Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
