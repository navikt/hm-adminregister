import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { logNavigationEvent } from "utils/amplitude";

const RequiredLogin = ({ children }: { children: JSX.Element }) => {
  const { loggedInUser } = useAuthStore();
  const { pathname } = useLocation();
  const isLoggedIn = loggedInUser?.exp && Date.parse(loggedInUser.exp) > Date.now();

  if (!isLoggedIn) {
    logNavigationEvent("login", "login wrapper", pathname);
    return <Navigate to="/logg-inn" state={pathname} replace />;
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
