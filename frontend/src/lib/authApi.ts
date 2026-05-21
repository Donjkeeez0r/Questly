import { api } from './api'
import type { AuthPayload, CurrentUser } from '../types/api'

interface AuthFormData {
  email: string
  password: string
  role?: 'USER' | 'CREATOR'
}

export async function loginUser(payload: AuthFormData) {
  const { data } = await api.post<AuthPayload>('/auth/login', payload)
  return data
}

export async function registerUser(payload: AuthFormData) {
  const { data } = await api.post<AuthPayload>('/auth/register', payload)
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get<CurrentUser>('/auth/me')
  return data
}
