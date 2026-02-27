import { Heading, VStack } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import useSWR from "swr";
import { SupplierDTO } from "utils/supplier-util";
import { fetcherGET } from "utils/swr-hooks";
import { SupplierInventoryDTO } from "utils/types/response-types";
import { useAuthStore } from "utils/store/useAuthStore";
import { Link } from "react-router-dom";

const SupplierInventoryInfo = ({ supplier }: { supplier: SupplierDTO }) => {
  const { data: data } = useSWR<SupplierInventoryDTO>(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/supplier-inventory/${supplier.id}`,
    fetcherGET,
  );

  const { loggedInUser } = useAuthStore();

  if (loggedInUser && loggedInUser.isAdmin && data && data.numberOfSeries > 0) {
    return (
      <VStack gap="space-6">
        <Heading level="2" size="medium">
          Info
        </Heading>

        <DefinitionList horizontal>
          <Link to={`/produkter?supplier=${supplier.id}`}>
            <DefinitionList.Term>Antall aktive produktserier</DefinitionList.Term>
          </Link>
          <Link to={`/produkter?supplier=${supplier.id}`}>
            <DefinitionList.Definition>{data?.numberOfSeries}</DefinitionList.Definition>
          </Link>
          <DefinitionList.Term>Antall aktive varianter</DefinitionList.Term>
          <DefinitionList.Definition>{data?.numberOfVariants}</DefinitionList.Definition>
        </DefinitionList>
      </VStack>
    );
  }

  return (
    <VStack gap="space-6">
      <Heading level="2" size="medium">
        Info
      </Heading>

      <DefinitionList horizontal>
        <DefinitionList.Term>Antall aktive produktserier</DefinitionList.Term>
        <DefinitionList.Definition>{data?.numberOfSeries}</DefinitionList.Definition>
        <DefinitionList.Term>Antall aktive varianter</DefinitionList.Term>
        <DefinitionList.Definition>{data?.numberOfVariants}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  );
};

export default SupplierInventoryInfo;
