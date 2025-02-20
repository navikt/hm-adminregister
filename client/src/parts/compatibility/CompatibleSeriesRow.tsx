import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Link, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import React from "react";

interface CompatibleSeriesRowProps {
  productIds: string[];
  seriesUUID: string;
}

export const CompatibleSeriesRow = ({ productIds, seriesUUID }: CompatibleSeriesRowProps) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);
  const noConnectedVariants = series?.variants.filter((variant) => productIds.includes(variant.id)).length ?? 0;

  if (isLoadingSeries) {
    return (
      <Table.Row key={`${seriesUUID}`} shadeOnHover={true}>
        <Table.DataCell colSpan={4}>
          <Loader />
        </Table.DataCell>
      </Table.Row>
    );
  }
  if (!series) {
    return <></>;
  }

  return (
    <Table.Row key={seriesUUID} shadeOnHover={false}>
      <Table.DataCell>
        {series.title}{" "}
        {series.isPublished && (
          <Link href={`${HM_REGISTER_URL()}/produkt/${series.id}`} target={"_blank"}>
            <ExternalLinkIcon title="Se serie på Finn Hjelpemiddel" />
          </Link>
        )}
      </Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>
      <Table.DataCell>
        {noConnectedVariants} / {series.variants.length}
      </Table.DataCell>
      {/*<Table.DataCell>*/}
      {/*  <Checkbox hideLabel checked={false} onChange={() => {}}>*/}
      {/*    {" "}*/}
      {/*  </Checkbox>*/}
      {/*</Table.DataCell>*/}
    </Table.Row>
  );
};
