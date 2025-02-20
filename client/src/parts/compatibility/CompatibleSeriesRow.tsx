import { useSeriesV2Conditional } from "api/SeriesApi";
import { Button, Checkbox, Link, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon, TrashIcon } from "@navikt/aksel-icons";
import React from "react";

export const CompatibleSeriesRow = ({ seriesUUID }: { seriesUUID: string }) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);

  if (isLoadingSeries) {
    return <Loader />;
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
        <Button
          iconPosition="right"
          variant={"tertiary"}
          icon={<TrashIcon title="Slett" fontSize="1.5rem" />}
          onClick={() => {}}
        />
      </Table.DataCell>
      <Table.DataCell>
        <Checkbox hideLabel checked={false} onChange={() => {}}>
          {" "}
        </Checkbox>
      </Table.DataCell>
    </Table.Row>
  );
};
