import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './utils/store/useAuthStore'

export const ProtectedRoute = () => {
  const { loggedInUser } = useAuthStore()

  if (!loggedInUser) {
    return (
      <Navigate to='/logg-inn' />
    )
  } else {
    return <Outlet />
  }


}