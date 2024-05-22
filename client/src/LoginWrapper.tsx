import { Navigate, Outlet, useLocation } from "react-router-dom";
import React from "react";
import { useAuthStore } from "utils/store/useAuthStore";

const RequiredLogin = ({ children }: { children: JSX.Element }) => {
  const { loggedInUser } = useAuthStore();
  const location = useLocation();
  const isLoggedIn = loggedInUser?.exp && Date.parse(loggedInUser.exp) > Date.now();

  if (!isLoggedIn) {
    return <Navigate to="/logg-inn" state={{ from: location }} replace />;
  }

  return children;
};

export const LoginWrapper = () => {
  return (
    <RequiredLogin>
      <Outlet />
    </RequiredLogin>
  );
};
