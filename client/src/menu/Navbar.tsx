import { useState } from "react";
import classNames from "classnames";
import ProfileMenu from "./ProfileMenu";
import {
  Buldings3Icon,
  FileCheckmarkFillIcon,
  MenuHamburgerIcon,
  FileXMarkFillIcon,
  NewspaperIcon,
  PackageFillIcon,
  PencilLineIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import { Button, Heading, HStack, VStack } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className={classNames("menu", { open: menuOpen })} aria-label="hovednavigering">
        <div className="menu__logo">Finn Hjelpemiddel Admin og registrering</div>
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
        <VStack gap="32" className="menu__desktop">
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

      <NavLink to="/produkter" className="page-link">
        {pathname.startsWith("/produkter") && <div className="active-indicator" />}
        <div className="line" />
        <HStack gap="4" style={{ paddingLeft: "16px" }}>
          <PackageFillIcon fontSize={"1.5rem"} aria-hidden />
          <span>Produkter</span>
        </HStack>
      </NavLink>

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

      {loggedInUser && !loggedInUser.isAdmin && (
        <NavLink to="/avslaatt-produkt" className="page-link">
          {pathname.startsWith("/avslaatt-produkt") && <div className="active-indicator" />}
          <div className="line" />
          <HStack gap="4" style={{ paddingLeft: "16px" }}>
            <FileXMarkFillIcon fontSize={"1.5rem"} title="avslaatt-produkt" />
            <span>Avslåtte produkter</span>
          </HStack>
        </NavLink>
      )}
    </VStack>
  );
};
