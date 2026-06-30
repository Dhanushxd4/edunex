const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('edunex_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// AUTH
export const api = {
  auth: {
    register: (data: { email: string; password: string; fullName: string }) =>
      request<{ token: string; user: any }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/api/auth/me'),
    updateProfile: (data: any) => request<any>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  courses: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<{ courses: any[]; total: number; page: number; totalPages: number }>(`/api/courses${qs}`);
    },
    get: (id: string) => request<any>(`/api/courses/${id}`),
    create: (data: any) => request<any>('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getLessons: (id: string) => request<any[]>(`/api/courses/${id}/lessons`),
    addLesson: (id: string, data: any) => request<any>(`/api/courses/${id}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  },
  enrollments: {
    enroll: (courseId: string) => request<any>(`/api/enrollments/${courseId}`, { method: 'POST' }),
    myEnrollments: () => request<any[]>('/api/enrollments/my'),
    check: (courseId: string) => request<{ enrolled: boolean; enrollment: any }>(`/api/enrollments/${courseId}/check`),
  },
  progress: {
    update: (lessonId: string, data: { courseId: string; completed: boolean; watchTimeSeconds: number }) =>
      request<any>(`/api/progress/lesson/${lessonId}`, { method: 'POST', body: JSON.stringify(data) }),
    getCourseProgress: (courseId: string) => request<any>(`/api/progress/course/${courseId}`),
  },
  quizzes: {
    get: (id: string) => request<any>(`/api/quizzes/${id}`),
    submit: (id: string, answers: Record<string, number>) =>
      request<any>(`/api/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
    getAttempts: (id: string) => request<any[]>(`/api/quizzes/${id}/attempts`),
  },
  reviews: {
    getCourse: (courseId: string) => request<any[]>(`/api/reviews/course/${courseId}`),
    submit: (courseId: string, data: { rating: number; comment: string }) =>
      request<any>(`/api/reviews/course/${courseId}`, { method: 'POST', body: JSON.stringify(data) }),
  },
  youtube: {
    search: (q: string, maxResults = 10) => request<any>(`/api/youtube/search?q=${encodeURIComponent(q)}&maxResults=${maxResults}`),
    video: (id: string) => request<any>(`/api/youtube/video/${id}`),
  },
  users: {
    profile: (id: string) => request<any>(`/api/users/${id}/profile`),
    dashboard: () => request<any>('/api/users/dashboard'),
  },
};

// Token helpers
export function saveToken(token: string) { localStorage.setItem('edunex_token', token); }
export function clearToken() { localStorage.removeItem('edunex_token'); }
export function isLoggedIn() { return !!getToken(); }
