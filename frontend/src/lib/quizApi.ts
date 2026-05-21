import { api } from './api'
import type {
  AiFeedback,
  Achievement,
  CreateAchievementPayload,
  CreateQuizPayload,
  LeaderboardEntry,
  QuizForEdit,
  QuizForPlay,
  QuizSummary,
  SubmitAnswer,
  SubmitResult,
  UpdateQuizPayload,
  UserAchievement,
} from '../types/api'

export async function getQuizzes() {
  const { data } = await api.get<QuizSummary[]>('/quiz')
  return data
}

export async function createQuiz(payload: CreateQuizPayload) {
  const { data } = await api.post<QuizSummary>('/quiz', payload)
  return data
}

export async function updateQuiz(id: string, payload: UpdateQuizPayload) {
  const { data } = await api.patch<QuizSummary>(`/quiz/${id}`, payload)
  return data
}

export async function deleteQuiz(id: string) {
  const { data } = await api.delete<{ message: string }>(`/quiz/${id}`)
  return data
}

export async function getQuizById(id: string) {
  const { data } = await api.get<QuizForPlay>(`/quiz/${id}`)
  return data
}

export async function getQuizForEdit(id: string) {
  const { data } = await api.get<QuizForEdit>(`/quiz/${id}/edit`)
  return data
}

export async function submitQuizAnswers(id: string, answers: SubmitAnswer[]) {
  const { data } = await api.post<SubmitResult>(`/quiz/${id}/submit`, { answers })
  return data
}

export async function getQuizLeaderboard(id: string) {
  const { data } = await api.get<LeaderboardEntry[]>(`/quiz/${id}/leaderboad`)
  return data
}

export async function getMyAchievements() {
  const { data } = await api.get<UserAchievement[]>('/quiz/achievements/my')
  return data
}

export async function getAiFeedback(attemptId: string) {
  const { data } = await api.get<AiFeedback>(`/quiz/attempts/${attemptId}/ai-feedback`)
  return data
}

export async function createAchievement(quizId: string, payload: CreateAchievementPayload) {
  // Prisma schema expects `Icon` (capitalized). Map frontend `icon` -> `Icon`.
  const body: any = { ...payload }
  if ((body as any).icon !== undefined) {
    body.Icon = body.icon
    delete body.icon
  }
  const { data } = await api.post<Achievement>(`/quiz/${quizId}/achievements`, body)
  return data
}
