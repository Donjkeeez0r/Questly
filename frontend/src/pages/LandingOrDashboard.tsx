import { DashboardPage } from './DashboardPage'
import { LandingPage } from './LandingPage'

export function LandingOrDashboard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('quiz_access_token') : null

  if (token) {
    return <DashboardPage />
  }

  return <LandingPage />
}

export default LandingOrDashboard
