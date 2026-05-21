export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type UserRole = 'USER' | 'CREATOR'

export interface AuthPayload {
  access_token: string
}

export interface CurrentUser {
  id: string
  email: string
  role: UserRole
  createdAt: string
}

export interface QuizSummary {
  id: string
  title: string
  description?: string | null
  difficulty: Difficulty
  timeLimit?: number | null
  creatorId: string
  createdAt: string
}

export interface CreateAnswerOptionPayload {
  text: string
  isCorrect: boolean
}

export interface CreateQuestionPayload {
  text: string
  hint?: string
  options: CreateAnswerOptionPayload[]
}

export interface CreateQuizPayload {
  title: string
  description?: string
  difficulty: Difficulty
  timeLimit?: number
  questions: CreateQuestionPayload[]
}

export interface CreateAchievementPayload {
  name: string
  description: string
  scoreRequired: number
  icon?: string
}

export interface UpdateQuizPayload {
  title?: string
  description?: string
  difficulty?: Difficulty
  timeLimit?: number
  questions?: CreateQuestionPayload[]
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizEditableOption extends QuizOption {
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  text: string
  hint?: string | null
  options: QuizOption[]
}

export interface QuizEditableQuestion {
  id: string
  text: string
  hint?: string | null
  options: QuizEditableOption[]
}

export interface QuizForPlay {
  id: string
  title: string
  description?: string | null
  difficulty: Difficulty
  timeLimit?: number | null
  creatorId: string
  createdAt: string
  questions: QuizQuestion[]
  attemptsCount?: number
  achievements?: Achievement[]
}

export interface QuizForEdit {
  id: string
  title: string
  description?: string | null
  difficulty: Difficulty
  timeLimit?: number | null
  questions: QuizEditableQuestion[]
  attemptsCount?: number
}

export interface SubmitAnswer {
  questionId: string
  selectedOptionId?: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  Icon?: string | null
  scoreRequired: number
  quizId: string
}

export interface SubmitResult {
  message: string
  score: number
  correctCount: number
  totalQuestions: number
  attemptId: string
  newAchievements: Achievement[]
}

export interface LeaderboardEntry {
  id: string
  score: number
  userId: string
  quizId: string
  createdAt: string
  user: {
    id: string
    email: string
  }
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  createdAt: string
  achievement: Achievement
}

export interface AiFeedback {
  feedback: string
  wrongAnswersCount?: number
}
