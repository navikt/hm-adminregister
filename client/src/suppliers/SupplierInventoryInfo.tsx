import { SupplierDTO } from "utils/supplier-util";
import { Heading, VStack } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { SupplierInventoryDTO } from "utils/types/response-types";
import styles from "./SupplierInventoryInfo.module.scss";

const SupplierInventoryInfo = ({ supplier }: { supplier: SupplierDTO }) => {
  const { data: data } = useSWR<SupplierInventoryDTO>(
    `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/supplier-inventory/${supplier.id}`,
    fetcherGET,
  );

  return (
    <VStack gap="8">
      <VStack gap="6">
        <Heading level="2" size="medium" spacing>
          Info
        </Heading>
      </VStack>
      <dl className={styles.descriptionList}>
        <dt>Antall aktive produktserier</dt>
        <dd>{data?.numberOfSeries}</dd>
        <dt>Antall aktive varianter</dt>
        <dd>{data?.numberOfVariants}</dd>
      </dl>
    </VStack>
  );
};

export default SupplierInventoryInfo;
