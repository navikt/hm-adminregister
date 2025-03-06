import { useSeriesV2Conditional } from "api/SeriesApi";
import { Button, Checkbox, Link, Loader, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { ArrowLeftIcon, ExternalLinkIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import React from "react";
import { addCompatibleWithVariantList } from "api/PartApi";

interface CompatibleSeriesRowProps {
  productIds: string[];
  seriesUUID: string;
  setAddModalIsOpen: (isOpen: boolean) => void;
  setRemoveModalIsOpen: (isOpen: boolean) => void;
  setSelectedSeriesId: (seriesId: string) => void;
  selectedRows: string[];
  toggleSelectedRow: (id: string) => void;
  partId: string;
  mutatePart: () => void;
}

export const CompatibleSeriesRow = ({
  productIds,
  seriesUUID,
  setAddModalIsOpen,
  setRemoveModalIsOpen,
  setSelectedSeriesId,
  selectedRows,
  toggleSelectedRow,
  partId,
  mutatePart,
}: CompatibleSeriesRowProps) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);

  const connectedVariants = series?.variants.filter((variant) => productIds.includes(variant.id)) ?? [];

  const noConnectedVariants = connectedVariants.length;

  const addAllVariantsFromSeries = () => {
    if (series) {
      addCompatibleWithVariantList(
        partId,
        series.variants.map((variant) => variant.id),
      )
        .then(() => {
          mutatePart();
        })
        .catch((error) => {});
    }
  };

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
        <Button
          iconPosition="right"
          variant={"tertiary"}
          icon={<PencilWritingIcon title="Rediger" fontSize="1.2rem" />}
          disabled={noConnectedVariants === 0}
          onClick={() => {
            setSelectedSeriesId(seriesUUID);
            setRemoveModalIsOpen(true);
          }}
        >
          {noConnectedVariants} / {series.variants.length}
        </Button>
      </Table.DataCell>
      <Table.DataCell>
        <Button
          variant="tertiary"
          icon={<ArrowLeftIcon />}
          disabled={noConnectedVariants === series.variants.length}
          onClick={addAllVariantsFromSeries}
        />
      </Table.DataCell>
      <Table.DataCell>
        <Button
          iconPosition="right"
          variant={"tertiary"}
          icon={<PencilWritingIcon title="Rediger" fontSize="1.2rem" />}
          disabled={series.variants.length - noConnectedVariants === 0}
          onClick={() => {
            setSelectedSeriesId(seriesUUID);
            setAddModalIsOpen(true);
          }}
        >
          {series.variants.length - noConnectedVariants} / {series.variants.length}
        </Button>
      </Table.DataCell>
      <Table.DataCell>
        <Checkbox
          hideLabel
          checked={selectedRows.includes(series.id)}
          onChange={() => {
            toggleSelectedRow(series.id!);
          }}
        >
          {" "}
        </Checkbox>
      </Table.DataCell>
    </Table.Row>
  );
};
