import React, { useState } from "react";
import { Alert, BodyShort, Button, Detail, VStack } from "@navikt/ds-react";
import {
  Buldings3Icon,
  ChevronDownIcon,
  LeaveIcon,
  PersonCircleIcon,
  PersonIcon,
  PersonRectangleIcon,
} from "@navikt/aksel-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { HM_REGISTER_URL } from "environments";

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
            ) : (
              <Buldings3Icon fontSize="2.25rem" aria-hidden />
            )}
            <VStack align={"start"}>
              <BodyShort className="text-overflow-hidden-small">
                {loggedInUser?.isAdmin ? "Administrator" : loggedInUser?.supplierName}
              </BodyShort>
              <BodyShort size="small">{loggedInUser?.userName}</BodyShort>
            </VStack>
          </span>
          <ChevronDownIcon aria-hidden fontSize="1.5rem" />
        </Button>
        {open && (
          <div id="user-menu-expanded" aria-labelledby="user-menu-button" className="user-menu__expanded-content">
            <Link to={loggedInUser?.isAdmin ? "/admin/profil" : "/profil"} className="user-menu__profile-link">
              <PersonRectangleIcon
                title="Min profil"
                fontSize={loggedInUser?.isAdmin ? "2.5rem" : "1.5rem"}
                aria-hidden
              />
              {loggedInUser?.isAdmin ? "Min profil og admin brukere" : "Min profil"}
            </Link>
            <span className="line" />
            <Link to="/auth/logout" className="user-menu__logout-link" onClick={handleLogout}>
              <LeaveIcon title="Logg ut" fontSize="1.5rem" aria-hidden /> Logg ut
            </Link>
            {error && <Alert variant="error">Feil ved utlogging. Error message: {error.message}</Alert>}
          </div>
        )}
      </div>
      <div className="user-menu user-menu__tablet">
        <Button
          onClick={() => (loggedInUser?.isAdmin ? navigate("/admin/profil") : navigate("/profil"))}
          aria-selected={pathname === "/profil" || pathname === "/admin/profil"}
          className="user-menu__profile-link"
          icon={<PersonCircleIcon title="profile" fontSize="2.25rem" />}
        ></Button>
        <Link to="/auth/logout" className="user-menu__logout-link" onClick={handleLogout}>
          <LeaveIcon fontSize="1.5rem" aria-hidden /> <Detail>Logg ut</Detail>
        </Link>
      </div>
    </>
  );
};

export default ProfileMenu;
