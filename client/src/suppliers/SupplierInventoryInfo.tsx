import { Heading, VStack } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import useSWR from "swr";
import { SupplierDTO } from "utils/supplier-util";
import { fetcherGET } from "utils/swr-hooks";
import { SupplierInventoryDTO } from "utils/types/response-types";

const SupplierInventoryInfo = ({ supplier }: { supplier: SupplierDTO }) => {
  const { data: data } = useSWR<SupplierInventoryDTO>(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/supplier-inventory/${supplier.id}`,
    fetcherGET,
  );

  return (
    <VStack gap="6">
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
