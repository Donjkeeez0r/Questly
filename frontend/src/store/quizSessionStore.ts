import { create } from 'zustand'
import type { SubmitResult } from '../types/api'

interface QuizSessionState {
  latestResult: SubmitResult | null
  setLatestResult: (result: SubmitResult) => void
  clearLatestResult: () => void
}

export const useQuizSessionStore = create<QuizSessionState>((set) => ({
  latestResult: null,
  setLatestResult: (result) => set({ latestResult: result }),
  clearLatestResult: () => set({ latestResult: null }),
}))
