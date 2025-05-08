import { Heading, HGrid, Loader, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SupplierDTO } from "utils/supplier-util";
import { useUser } from "utils/swr-hooks";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import { formatPhoneNumber } from "utils/string-util";

export default function HmsUserProfile() {
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDTO>();
  const { loggedInUser } = useAuthStore();
  const { user, userError, userIsLoading } = useUser(loggedInUser);

  const { setGlobalError } = useErrorStore();

  if (userIsLoading || !user) return <Loader size="3xlarge" title="Henter brukeropplysninger" />;
  if (error)
    return (
      <div>
        <span className="auth-dialog-box__error-message">{error?.message}</span>
      </div>
    );

  return (
    <main className="show-menu">
      <HGrid columns="minmax(16rem, 55rem)">
        <Heading level="1" size="large" spacing>
          Min profil
        </Heading>
        <VStack gap="20">
          <DefinitionList horizontal>
            <DefinitionList.Term>Name</DefinitionList.Term>
            <DefinitionList.Definition>{user?.name}</DefinitionList.Definition>
            <DefinitionList.Term>E-post</DefinitionList.Term>
            <DefinitionList.Definition>{user?.email}</DefinitionList.Definition>
            <DefinitionList.Term>Telefon</DefinitionList.Term>
            <DefinitionList.Definition>
              {user.attributes.phone ? formatPhoneNumber(user?.attributes?.phone) : "Ikke oppgitt"}
            </DefinitionList.Definition>
          </DefinitionList>
        </VStack>
      </HGrid>
    </main>
  );
}
