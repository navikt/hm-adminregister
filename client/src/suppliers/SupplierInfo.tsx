import { Link, useNavigate } from "react-router-dom";

import { ArrowLeftIcon, Buildings3Icon, CogIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, Heading, HStack, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import LocalTag, { colors } from "felleskomponenter/LocalTag";
import { useAuthStore } from "utils/store/useAuthStore";
import { SupplierDTO } from "utils/supplier-util";

const SupplierInfo = ({
  supplier,
  setIsOpen,
  setIsOpenActivateSupplier,
}: {
  supplier: SupplierDTO;
  setIsOpen: (newState: boolean) => void;
  setIsOpenActivateSupplier: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();
  return (
    <VStack gap="space-8">
      <VStack gap="space-6">
        {loggedInUser?.isAdmin && (
          <Link to="/leverandor" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3A4583" }}>
            <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
            Tilbake til alle leverandører
          </Link>
        )}
        <Buildings3Icon title="leverandor" fontSize="2.5rem" aria-hidden />
        <HStack gap="space-8" align="start" style={{ alignItems: supplier.status === "INACTIVE" ? "start" : "center" }}>
          <div style={{ minWidth: "300px" }}>
            <Heading level="1" size="large">
              {supplier?.name}
            </Heading>
            {supplier.status === "INACTIVE" && <LocalTag icon={<></>} text="Inaktiv" color={colors.GREY} />}
          </div>
          <Dropdown>
            <Button variant="secondary" icon={<CogIcon title="Handlinger" />} as={Dropdown.Toggle}></Button>
            <Dropdown.Menu>
              <Dropdown.Menu.List>
                <Dropdown.Menu.List.Item
                  onClick={() => {
                    navigate(
                      loggedInUser?.isAdmin
                        ? `/leverandor/rediger-leverandor/${supplier.id}`
                        : "/profil/rediger-leverandor",
                    );
                  }}
                >
                  Rediger
                  <PencilWritingIcon aria-hidden />
                </Dropdown.Menu.List.Item>
                {loggedInUser?.isAdmin && supplier.status === "ACTIVE" && (
                  <Dropdown.Menu.List.Item
                    onClick={() => {
                      setIsOpen(true);
                    }}
                  >
                    Deaktiver leverandør
                  </Dropdown.Menu.List.Item>
                )}
                {loggedInUser?.isAdmin && supplier.status === "INACTIVE" && (
                  <Dropdown.Menu.List.Item
                    onClick={() => {
                      setIsOpenActivateSupplier(true);
                    }}
                  >
                    Aktiver leverandør
                  </Dropdown.Menu.List.Item>
                )}
              </Dropdown.Menu.List>
            </Dropdown.Menu>
          </Dropdown>
        </HStack>
      </VStack>

      <DefinitionList horizontal>
        <DefinitionList.Term>E-post</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.email || "-"}</DefinitionList.Definition>
        <DefinitionList.Term>Telefon</DefinitionList.Term>
        <DefinitionList.Definition>{supplier.phone || "-"}</DefinitionList.Definition>
        <DefinitionList.Term>Nettside</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.homepageUrl || "-"}</DefinitionList.Definition>
        <DefinitionList.Term>Adresse</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.address || "-"}</DefinitionList.Definition>
        <DefinitionList.Term>Postnummer</DefinitionList.Term>
        <DefinitionList.Definition>{supplier.postNr || "-"}</DefinitionList.Definition>
        <DefinitionList.Term>Sted</DefinitionList.Term>
        <DefinitionList.Definition>{supplier.postLocation || "-"}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  );
};

export default SupplierInfo;
