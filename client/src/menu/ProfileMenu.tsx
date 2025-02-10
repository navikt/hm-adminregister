import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Buldings3Icon,
  ChevronDownIcon,
  LeaveIcon,
  PersonCircleIcon,
  PersonIcon,
  PersonRectangleIcon,
} from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Detail, HGrid, VStack } from "@navikt/ds-react";

import { HM_REGISTER_URL } from "environments";
import { useAuthStore } from "utils/store/useAuthStore";

const ProfileMenu = () => {
  const [error, setError] = useState<Error | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { loggedInUser, clearLoggedInState } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  async function handleLogout(event: any) {
    event.preventDefault();
    try {
      const res = await fetch(`${HM_REGISTER_URL()}/admreg/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.status === 200) {
        clearLoggedInState();
        navigate("/logg-inn");
      }
    } catch (e: any) {
      setError(e);
    }
  }

  return (
    <>
      <div className="user-menu user-menu__desktop-and-phone">
        <Button
          className="user-menu__button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="user-menu-expanded"
          id="user-menu-button"
        >
          <span className="icon-name-container">
            {loggedInUser?.isAdmin ? (
              <PersonIcon fontSize="2.25rem" aria-hidden />
            ) : loggedInUser?.isHmsUser ? (
              <PersonIcon fontSize="2.25rem" aria-hidden />
            ) : (
              <Buldings3Icon fontSize="2.25rem" aria-hidden />
            )}
            <VStack align={"start"}>
              <BodyShort className="text-overflow-hidden-small">
                {loggedInUser?.isAdmin ? "Administrator" : loggedInUser?.isHmsUser ? "HMS" : loggedInUser?.supplierName}
              </BodyShort>
              <BodyShort size="small" style={{ textAlign: "start" }}>
                {loggedInUser?.userName}
              </BodyShort>
            </VStack>
          </span>
          <ChevronDownIcon aria-hidden fontSize="1.5rem" />
        </Button>
        {open && (
          <div id="user-menu-expanded" aria-labelledby="user-menu-button" className="user-menu__expanded-content">
            <HGrid asChild columns={"1.7rem 1fr"} gap="2">
              <Link
                to={loggedInUser?.isAdmin ? "/admin/profil" : loggedInUser?.isHmsUser ? "/hms-bruker" : "/profil"}
                className="user-menu__profile-link"
              >
                <PersonRectangleIcon title="Min profil" fontSize="1.5rem" aria-hidden />
                {loggedInUser?.isAdmin
                  ? "Min profil og admin brukere"
                  : loggedInUser?.isHmsUser
                    ? "Min profil"
                    : "Leverandør- og brukerinformasjon"}
              </Link>
            </HGrid>
            <span className="line" />
            <HGrid asChild columns={"1.7rem 1fr"} gap="2">
              <Link to="/auth/logout" className="user-menu__logout-link" onClick={handleLogout}>
                <LeaveIcon title="Logg ut" fontSize="1.5rem" aria-hidden /> Logg ut
              </Link>
            </HGrid>
            {error && <Alert variant="error">Feil ved utlogging. Error message: {error.message}</Alert>}
          </div>
        )}
      </div>
      <div className="user-menu user-menu__tablet">
        <Button
          onClick={() =>
            loggedInUser?.isAdmin
              ? navigate("/admin/profil")
              : loggedInUser?.isHmsUser
                ? navigate("/hms-bruker")
                : navigate("/profil")
          }
          aria-selected={pathname === "/profil" || pathname === "/admin/profil"}
          className="user-menu__profile-link"
          icon={<PersonCircleIcon title="profile" fontSize="2.25rem" />}
        ></Button>
        <HGrid asChild columns={"1.7rem 1fr"} gap="2">
          <Link to="/auth/logout" className="user-menu__logout-link" onClick={handleLogout}>
            <LeaveIcon fontSize="1.5rem" aria-hidden /> <Detail>Logg ut</Detail>
          </Link>
        </HGrid>
      </div>
    </>
  );
};

export default ProfileMenu;
