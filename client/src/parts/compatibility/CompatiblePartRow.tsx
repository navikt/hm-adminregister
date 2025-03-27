import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import React from "react";
import { useCompatibleProductById } from "api/PartApi";
import { Link } from "react-router-dom";

export const CompatiblePartRow = ({
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
          <Link to={`/del/${product.id}`}>{product.articleName}</Link>{" "}
        </>
      </Table.DataCell>
      <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>
      <Table.DataCell>
        {" "}
        {series.isPublished && product.hmsArtNr && (
          <Link to={`${HM_REGISTER_URL()}/produkt/hmsartnr/${product.hmsArtNr}`} target={"_blank"}>
            <ExternalLinkIcon fontSize="1.5rem" title="Se variant på Finn Hjelpemiddel" />
          </Link>
        )}
      </Table.DataCell>
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
