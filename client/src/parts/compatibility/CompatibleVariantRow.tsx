import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Link, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import React from "react";
import { useCompatibleProductById } from "api/PartApi";

export const CompatibleVariantRow = ({
  productId,
  selectedRows,
  toggleSelectedRow,
}: {
  productId: string;
  selectedRows: string[];
  toggleSelectedRow: (id: string) => void;
}) => {
  const { product, isLoading, error } = useCompatibleProductById(productId);
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
        <>
          {product.articleName}{" "}
          {series.isPublished && product.hmsArtNr && (
            <Link href={`${HM_REGISTER_URL()}/produkt/hmsartnr/${product.hmsArtNr}`} target={"_blank"}>
              <ExternalLinkIcon title="Se variant på Finn Hjelpemiddel" />
            </Link>
          )}
        </>
      </Table.DataCell>
      <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>
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
    </Table.Row>
  );
};
