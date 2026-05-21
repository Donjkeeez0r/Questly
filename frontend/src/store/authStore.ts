import { create } from 'zustand'

interface DecodedToken {
  sub?: string
  role?: string
}

interface AuthState {
  token: string | null
  userId: string | null
  role: string | null
  setToken: (token: string) => void
  logout: () => void
}

const TOKEN_KEY = 'quiz_access_token'

function decodeToken(token: string): DecodedToken {
  try {
    const payload = token.split('.')[1]

    if (!payload) {
      return {}
    }

    const json = atob(payload)
    return JSON.parse(json) as DecodedToken
  } catch {
    return {}
  }
}

function readInitialToken() {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    return { token: null, userId: null, role: null }
  }

  const decoded = decodeToken(token)

  return {
    token,
    userId: decoded.sub ?? null,
    role: decoded.role ?? null,
  }
}

const initialState = readInitialToken()

export const useAuthStore = create<AuthState>((set) => ({
  token: initialState.token,
  userId: initialState.userId,
  role: initialState.role,
  setToken: (token) => {
    const decoded = decodeToken(token)
    localStorage.setItem(TOKEN_KEY, token)
    set({
      token,
      userId: decoded.sub ?? null,
      role: decoded.role ?? null,
    })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, userId: null, role: null })
  },
}))

export const authStorageKey = TOKEN_KEY
