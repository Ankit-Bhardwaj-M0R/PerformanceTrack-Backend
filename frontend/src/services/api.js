import axios from 'axios'

// Base API URL — all requests go through the Spring Cloud API Gateway (port 8092)
// The Vite dev server proxies /api → http://localhost:8092
const BASE_URL = '/api/v1'

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Automatically attach the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    // Get the JWT token from localStorage (saved after login)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// 1. Auto-unwrap the backend's ApiResponse<T> envelope so every service gets
//    the inner `data` field directly instead of { status, msg, data }.
// 2. Redirect to /login on 401 Unauthorized.
api.interceptors.response.use(
  (response) => {
    // Every backend endpoint returns ApiResponse<T> = { status, msg, data }
    // Unwrap it so callers receive T directly via response.data
    const body = response.data
    if (
      body !== null &&
      typeof body === 'object' &&
      typeof body.status === 'string' &&
      'data' in body &&
      typeof body.msg === 'string'
    ) {
      return { ...response, data: body.data }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
