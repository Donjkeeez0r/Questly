import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function CreatorRoute() {
  const role = useAuthStore((state) => state.role)

  if (role !== 'CREATOR') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
