import {
  Buldings3Icon, DatabaseIcon,
  FileCheckmarkFillIcon, FileExcelIcon,
  MenuHamburgerIcon,
  NewspaperIcon,
  PackageFillIcon,
  PencilLineIcon,
  WrenchIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import { Button, HStack, VStack } from "@navikt/ds-react";
import classNames from "classnames";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import ProfileMenu from "./ProfileMenu";
import { PersonGroupIcon } from "@navikt/aksel-icons";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className={classNames("menu", { open: menuOpen })} aria-label="hovednavigering">
        <span className="menu__logo">
          <span style={{ fontSize: "1.5rem" }}>FinnHjelpemiddel</span>
          <span style={{ fontSize: "1.125rem" }}> Admin og registrering</span>
        </span>
        <Button
          className="menu__burgermenu-button"
          icon={
            menuOpen ? (
              <XMarkIcon title="Lukk menyen" />
            ) : (
              <MenuHamburgerIcon title="Åpne menyen" style={{ color: "#272a3a" }} />
            )
          }
          variant="tertiary"
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <VStack gap="8" className="menu__desktop">
          <NavigationLinks menuOpen={true} />
          <ProfileMenu />
        </VStack>
        <div className={classNames("menu__mobile", { open: menuOpen })}>
          <NavigationLinks menuOpen={menuOpen} />
          {menuOpen && <ProfileMenu />}
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Navbar;

const NavigationLinks = ({ menuOpen }: { menuOpen: boolean }) => {
  const { pathname } = useLocation();
  const { loggedInUser } = useAuthStore();

  if (!menuOpen) {
    return <></>;
  }
  return (
    <VStack className="menu__nav-links">
      {loggedInUser && loggedInUser.isAdmin && (
        <>
          <NavLink to="/admin/dashboard" className="page-link">
            {pathname.startsWith("/admin/dashboard") && <div className="active-indicator" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <FileCheckmarkFillIcon fontSize="1.5rem" aria-hidden />
              <span>Dashboard</span>
            </HStack>
          </NavLink>
          <NavLink to="/rammeavtaler" className="page-link">
            {pathname.startsWith("/rammeavtaler") && <div className="active-indicator" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <PencilLineIcon fontSize="1.5rem" aria-hidden />
              <span>Rammeavtaler</span>
            </HStack>
          </NavLink>
          <NavLink to="/til-godkjenning" className="page-link">
            {pathname.startsWith("/til-godkjenning") && <div className="active-indicator" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <FileCheckmarkFillIcon fontSize="1.5rem" aria-hidden />
              <span>Til godkjenning</span>
            </HStack>
          </NavLink>
        </>
      )}

      {loggedInUser && loggedInUser.isSupplier && (
        <NavLink to="/leverandor/dashboard" className="page-link">
          {pathname.startsWith("/leverandor/dashboard") && <div className="active-indicator" />}
          <div className="line" />
          <HStack gap="4" style={{ paddingLeft: "16px" }}>
            <PersonGroupIcon fontSize="1.5rem" aria-hidden />
            <span>Dashboard</span>
          </HStack>
        </NavLink>
      )}

      {loggedInUser && (loggedInUser.isAdmin || loggedInUser.isSupplier) && (
        <NavLink to="/produkter" className="page-link">
          {pathname.startsWith("/produkter") && <div className="active-indicator" />}
          <div className="line" />
          <HStack gap="4" style={{ paddingLeft: "16px" }}>
            <PackageFillIcon fontSize={"1.5rem"} aria-hidden />
            <span>Produkter</span>
          </HStack>
        </NavLink>
      )}

      {loggedInUser && (loggedInUser.isAdmin || loggedInUser.isHmsUser || loggedInUser.isSupplier) && (
        <NavLink to="/deler" className="page-link">
          {pathname.startsWith("/deler") && <div className="active-indicator" />}
          <div className="line" />
          <HStack gap="4" style={{ paddingLeft: "16px" }}>
            <WrenchIcon fontSize={"1.5rem"} aria-hidden />
            <span>Deler</span>
          </HStack>
        </NavLink>
      )}

      {loggedInUser && loggedInUser.isAdmin && (
        <>
          <NavLink to="/leverandor" className="page-link">
            {pathname.startsWith("/leverandor") && <div className="active-indicator" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <Buldings3Icon fontSize={"1.5rem"} aria-hidden />
              <span>Leverandører</span>
            </HStack>
          </NavLink>

          <NavLink to="/nyheter" className="page-link">
            {pathname.startsWith("/nyheter") && <div className="active-indicator" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <NewspaperIcon fontSize={"1.5rem"} title="Nyheter" aria-hidden />
              <span>Nyheter</span>
            </HStack>
          </NavLink>
        </>
      )}
      {loggedInUser && loggedInUser.isAdmin && (
          <>
            <NavLink to="/tekniskdata" className="page-link">
              {pathname.startsWith("/tekniskdata") && <div className="active-indicator" />}
              <div className="line" />
              <HStack gap="4" style={{ paddingLeft: "16px" }}>
                <DatabaseIcon fontSize={"1.5rem"} aria-hidden />
                <span>Teknisk-data</span>
              </HStack>
            </NavLink>
          </>
      )}
      {loggedInUser && loggedInUser.isAdmin && (
          <>
            <NavLink to="/katalog" className="page-link">
              {pathname.startsWith("/katalog") && <div className="active-indicator" />}
              <div className="line" />
              <HStack gap="4" style={{ paddingLeft: "16px" }}>
                <FileExcelIcon fontSize={"1.5rem"} aria-hidden />
                <span>Katalog</span>
              </HStack>
            </NavLink>
          </>
      )}
    </VStack>
  );
};
