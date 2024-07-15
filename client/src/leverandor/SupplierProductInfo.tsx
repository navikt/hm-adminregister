import { Supplier } from "utils/supplier-util";
import { Heading, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import React from "react";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";

type SupplierProductInfo = {
  numberOfSeries: number;
};

const SupplierProductInfo = ({ supplier }: { supplier: Supplier }) => {
  const {data: data} = useSWR<SupplierProductInfo>(`${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations/productinfo/${supplier.id}`, fetcherGET);

  return (
    <VStack gap="8">
      <VStack gap="6">
        <Heading level="2" size="medium" spacing>
          Info
        </Heading>
      </VStack>
      <DefinitionList>
        <DefinitionList.Term>Antall produkter</DefinitionList.Term>
        <DefinitionList.Definition>{data?.numberOfSeries}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  );
};

export default SupplierProductInfo;
