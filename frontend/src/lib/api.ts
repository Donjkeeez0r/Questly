import axios from 'axios'
import { authStorageKey, useAuthStore } from '../store/authStore'

const baseURL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' && window.location.port === '3001' ? '' : '/api')

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token ?? localStorage.getItem(authStorageKey)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
