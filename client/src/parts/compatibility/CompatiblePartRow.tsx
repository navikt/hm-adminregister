import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Loader, Switch, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import { updateEgnetForBrukerpassbruker, updateEgnetForKommunalTekniker, useCompatibleProductById } from "api/PartApi";
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
  const { product, isLoading, error, mutate } = useCompatibleProductById(productId);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
    mutate: mutateSeries,
  } = useSeriesV2Conditional(product?.seriesUUID ?? undefined);

  const [isTogglingKT, setIsTogglingKT] = useState(false);
  const [isTogglingBP, setIsTogglingBP] = useState(false);

  const toggleEgnetForKommunalTekniker = (checked: boolean, id: string) => {
    setIsTogglingKT(true);
    updateEgnetForKommunalTekniker(id, checked).then(() => {
      mutate();
    });
    setIsTogglingKT(false);
  };
  const toggleEgnetForBrukerpassbruker = (checked: boolean, id: string) => {
    setIsTogglingBP(true);
    updateEgnetForBrukerpassbruker(id, checked).then(() => {
      mutate();
    });
    setIsTogglingBP(false);
  };

  if (isLoading || isLoadingSeries || !product || !series) {
    return (
      <Table.Row key={`${productId}`} shadeOnHover={true}>
        <Table.DataCell colSpan={4}>
          <Loader />
        </Table.DataCell>
      </Table.Row>
    );
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
        <Switch
          loading={isTogglingKT}
          disabled={isTogglingKT}
          checked={product.productData.attributes.egnetForKommunalTekniker || false}
          onChange={(e) => toggleEgnetForKommunalTekniker(e.target.checked, product.id)}
        >
          <></>
        </Switch>
      </Table.DataCell>
      <Table.DataCell>
        <Switch
          loading={isTogglingBP}
          disabled={isTogglingBP}
          checked={product.productData.attributes.egnetForBrukerpass || false}
          onChange={(e) => toggleEgnetForBrukerpassbruker(e.target.checked, product.id)}
        >
          <></>
        </Switch>
      </Table.DataCell>
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
