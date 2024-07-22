import { BodyShort, Button, Heading, HStack, VStack } from "@navikt/ds-react";
import { ArrowUndoIcon, Buldings3Icon, PencilWritingIcon } from "@navikt/aksel-icons";
import React from "react";
import { SupplierDTO } from "utils/supplier-util";
import { useAuthStore } from "utils/store/useAuthStore";
import DefinitionList from "../felleskomponenter/definition-list/DefinitionList";
import { formatPhoneNumber } from "utils/string-util";
import { Link, useNavigate } from "react-router-dom";

const SupplierInfo = ({ supplier, setIsOpen }: { supplier: SupplierDTO; setIsOpen: (newState: boolean) => void }) => {
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();
  return (
    <VStack gap="8">
      <VStack gap="6">
        {loggedInUser?.isAdmin && (
          <Link className="supplier-info__parent-page-link" to="/leverandor">
            <ArrowUndoIcon title="Tilbake til oversikt" fontSize="1.5rem" />
            Tilbake til oversikt
          </Link>
        )}
        <Buldings3Icon title="leverandor" fontSize="2.5rem" aria-hidden />
        <Heading level="1" size="large">
          {supplier?.name}
        </Heading>
        {supplier?.status === "INACTIVE" && <BodyShort>(INAKTIV)</BodyShort>}
      </VStack>
      <DefinitionList>
        <DefinitionList.Term>E-post</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.email}</DefinitionList.Definition>
        <DefinitionList.Term>Telefon</DefinitionList.Term>
        <DefinitionList.Definition>{supplier.phone && formatPhoneNumber(supplier.phone)}</DefinitionList.Definition>
        <DefinitionList.Term>Nettside</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.homepageUrl}</DefinitionList.Definition>
      </DefinitionList>
      <HStack gap="4">
        {loggedInUser?.isAdmin && (
          <Button
            className="fit-content"
            variant="secondary"
            size="small"
            icon={<PencilWritingIcon aria-hidden />}
            iconPosition="left"
            onClick={() => {
              navigate(`/leverandor/endre-leverandor/${supplier.id}`);
            }}
          >
            Endre leverandørinformasjon
          </Button>
        )}
        {loggedInUser?.isAdmin && supplier.status === "ACTIVE" && (
          <Button
            className="fit-content"
            variant="secondary"
            size="small"
            icon={<PencilWritingIcon aria-hidden />}
            iconPosition="left"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Deaktiver leverandør
          </Button>
        )}
      </HStack>
    </VStack>
  );
};

export default SupplierInfo;
