import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from 'utils/store/useAuthStore'

import type { JSX } from "react";

const RequiredLogin = ({ children }: { children: JSX.Element }) => {
  const { loggedInUser } = useAuthStore()
  const { pathname } = useLocation()
  const isLoggedIn = loggedInUser?.exp && Date.parse(loggedInUser.exp) > Date.now()

  if (!isLoggedIn) {
    return <Navigate to="/logg-inn" state={pathname} replace />
  }

  return children
}

export const LoginWrapper = () => {
  return (
    <RequiredLogin>
      <Outlet />
    </RequiredLogin>
  )
}
