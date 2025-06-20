import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Link, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import React from "react";
import { useCompatibleProductById } from "api/PartApi";
import { useAuthStore } from "utils/store/useAuthStore";

export const CompatibleVariantRow = ({
  productId,
  selectedRows,
  toggleSelectedRow,
  isEditable
}: {
  productId: string;
  selectedRows: string[];
  toggleSelectedRow: (id: string) => void;
  isEditable: boolean;
}) => {
  const loggedInUser = useAuthStore().loggedInUser;
  const isAdmin = loggedInUser?.isAdminOrHmsUser || false;
  const { product, isLoading, error } = useCompatibleProductById(productId, isAdmin);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
  } = useSeriesV2Conditional(product?.seriesUUID ?? undefined);

  if (isLoading || isLoadingSeries) {
    return (
      <Table.Row key={`${productId}`} shadeOnHover={true}>
        <Table.DataCell colSpan={4}>
          <Loader />
        </Table.DataCell>
      </Table.Row>
    );
  }
  if (!product || !series) {
    return <></>;
  }

  return (
    <Table.Row key={`${productId}`} shadeOnHover={true}>
      <Table.DataCell>
        <>{product.articleName} </>
      </Table.DataCell>
      <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>
      <Table.DataCell>
        {" "}
        {series.isPublished && product.hmsArtNr && (
          <Link href={`${HM_REGISTER_URL()}/produkt/hmsartnr/${product.hmsArtNr}`} target={"_blank"}>
            <ExternalLinkIcon fontSize="1.5rem" title="Se variant på Finn Hjelpemiddel" />
          </Link>
        )}
      </Table.DataCell>
      {isEditable && (
        <Table.DataCell>
          <Checkbox
            hideLabel
            checked={selectedRows.includes(product.id)}
            onChange={() => {
              toggleSelectedRow(product.id!);
            }}
          >
            {" "}
          </Checkbox>
        </Table.DataCell>
      )}

    </Table.Row>
  );
};
