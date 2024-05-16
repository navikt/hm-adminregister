import { Navigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { useAuthStore } from "utils/store/useAuthStore";

export const RequiredLogin = ({ children }: { children: JSX.Element }) => {
  const { loggedInUser } = useAuthStore();
  const location = useLocation();

  if (!loggedInUser) {
    return <Navigate to="/logg-inn" state={{ from: location }} replace />;
  }

  return children;
};

export const AuthenticationWrapper = () => {
  return (
    <RequiredLogin>
      <Outlet />
    </RequiredLogin>
  );
};
