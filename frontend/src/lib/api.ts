import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined
const BASE = apiUrl ? apiUrl + '/api' : '/api'

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edunex_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => {
    const payload = res.data as { data?: unknown } | null
    if (payload && typeof payload === 'object' && payload.data !== undefined) {
      res.data = payload.data
    }
    return res
  },
  (err) => {
    const e = (err?.response?.data ?? {}) as { error?: string; message?: string }
    const msg = e.error ?? e.message ?? (err as Error).message ?? 'Something went wrong'
    return Promise.reject(new Error(msg))
  },
)
