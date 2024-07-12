import React, { useState } from "react";
import classNames from "classnames";
import ProfileMenu from "./ProfileMenu";
import {
  Buldings3Icon,
  FileCheckmarkFillIcon,
  FileXMarkFillIcon,
  MenuHamburgerIcon,
  NewspaperIcon,
  PackageFillIcon,
  PencilLineIcon,
  RecordFillIcon,
  XMarkIcon,
} from "@navikt/aksel-icons";
import { Button, HStack, VStack } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { Link, useLocation } from "react-router-dom";
import { getAllProd } from "utils/swr-hooks";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const rejectedProducts = getAllProd();
  console.log(rejectedProducts);
  return (
    <nav className={classNames("menu", { open: menuOpen })}>
      <div className="menu__logo">Finn Hjelpemiddel (admin)</div>
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
          <Link
            to="/rammeavtaler"
            className={classNames("page-link", { "page-link--active": pathname.startsWith("/rammeavtaler") })}
            aria-selected={pathname.startsWith("/rammeavtaler")}
          >
            {pathname.startsWith("/rammeavtaler") && <div className="active" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <PencilLineIcon fontSize="1.5rem" />
              <span>Rammeavtaler</span>
            </HStack>
          </Link>
          <Link
            to="/til-godkjenning"
            className={classNames("page-link", { "page-link--active": pathname.startsWith("/til-godkjenning") })}
            aria-selected={pathname.startsWith("/til-godkjenning")}
          >
            {pathname.startsWith("/til-godkjenning") && <div className="active" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <FileCheckmarkFillIcon fontSize="1.5rem" />
              <span>Til godkjenning</span>
            </HStack>
          </Link>
        </>
      )}

      <Link
        to="/produkter"
        className={classNames("page-link", { "page-link--active": pathname.startsWith("/produkter") })}
        aria-selected={pathname.startsWith("/produkter")}
      >
        {pathname.startsWith("/produkter") && <div className="active" />}
        <div className="line" />
        <HStack gap="4" style={{ paddingLeft: "16px" }}>
          <PackageFillIcon fontSize={"1.5rem"} />
          <span>Produkter</span>
        </HStack>
      </Link>

      {loggedInUser && !loggedInUser.isAdmin && (
        <>
          <Link
            to="/avslaatt-produkt"
            className={classNames("page-link", { "page-link--active": pathname.startsWith("/avslaatt-produkt") })}
            aria-selected={pathname.startsWith("/avslaatt-produkt")}
          >
            {pathname.startsWith("/avslaatt-produkt") && <div className="active" />}
            <div className="line" />
            <HStack style={{ paddingLeft: "16px" }}>
              <FileXMarkFillIcon fontSize={"1.5rem"} />
              <span style={{ paddingLeft: "16px" }}>Avslått Produkter</span>
              {false && (
                <RecordFillIcon title="a11y-title" fontSize="1.5rem" style={{ color: "#F25C5C", display: "flex" }} />
              )}
            </HStack>
          </Link>
        </>
      )}

      {loggedInUser && loggedInUser.isAdmin && (
        <>
          <Link
            to="/leverandor"
            className={classNames("page-link", { "page-link--active": pathname.startsWith("/leverandor") })}
            aria-selected={pathname.startsWith("/leverandor")}
          >
            {pathname.startsWith("/leverandor") && <div className="active" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <Buldings3Icon fontSize={"1.5rem"} />
              <span>Leverandører</span>
            </HStack>
          </Link>

          <Link
            to="/nyheter"
            className={classNames("page-link", { "page-link--active": pathname.startsWith("/nyheter") })}
            aria-selected={pathname.startsWith("/nyheter")}
          >
            {pathname.startsWith("/nyheter") && <div className="active" />}
            <div className="line" />
            <HStack gap="4" style={{ paddingLeft: "16px" }}>
              <NewspaperIcon fontSize={"1.5rem"} />
              <span>Nyheter</span>
            </HStack>
          </Link>
        </>
      )}
    </VStack>
  );
};
