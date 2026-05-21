import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CreatorRoute } from './components/CreatorRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicOnlyRoute } from './components/PublicOnlyRoute'
import { CreateQuizPage } from './pages/CreateQuizPage'
import { EditQuizPage } from './pages/EditQuizPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { CreatorStudioPage } from './pages/CreatorStudioPage'
import { ProfilePage } from './pages/ProfilePage'
import { QuizPlayerPage } from './pages/QuizPlayerPage'
import { QuizResultPage } from './pages/QuizResultPage'
import { LeaderboardPreview } from './pages/LeaderboardPreview'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
        </Route>

        <Route path="/" element={<LandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/quiz/:id" element={<QuizPlayerPage />} />
            <Route path="/quiz/:id/result" element={<QuizResultPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<CreatorRoute />}>
              <Route path="/creator" element={<CreatorStudioPage />} />
              <Route path="/quiz/create" element={<CreateQuizPage />} />
                          <Route path="/quiz/:id/edit" element={<EditQuizPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/quiz/:id/leaderboard" element={<LeaderboardPreview />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
