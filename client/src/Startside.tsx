import { Navigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";

export const Startside = () => {
  const { loggedInUser } = useAuthStore();

  if (!loggedInUser) {
    return <Navigate to={"/logg-inn"} />;
  } else if (loggedInUser?.isAdmin) {
    return <Navigate to={"/admin/profil"} />;
  } else if (loggedInUser?.isHmsUser) {
    return <Navigate to={"/hms-bruker"} />;
  } else if (!loggedInUser?.isAdmin) {
    return <Navigate to={"/profil"} />;
  } else {
    return <Navigate to={"/logg-inn"} />;
  }
};
