import { useSeriesV2Conditional } from "api/SeriesApi";
import { Button, Checkbox, Loader, Table } from "@navikt/ds-react";
import React from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import { Link } from "react-router-dom";
import { addCompatibleWithVariantList } from "api/PartApi";
import { ArrowLeftIcon, ExternalLinkIcon, PencilWritingIcon } from "@navikt/aksel-icons";
import { HM_REGISTER_URL } from "environments";

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
  isEditable: boolean;
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
  isEditable,
}: CompatibleSeriesRowProps) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);

  const connectedVariants = series?.variants.filter((variant) => productIds.includes(variant.id)) ?? [];

  const noConnectedVariants = connectedVariants.length;
  const loggedInUser = useAuthStore().loggedInUser;
  const isAdmin = loggedInUser?.isAdminOrHmsUser || false;

  const addAllVariantsFromSeries = () => {
    if (series) {
      addCompatibleWithVariantList(
        partId,
        series.variants.map((variant) => variant.id),
        isAdmin
      )
        .then(() => {
          mutatePart();
        })
        .catch((error) => {
        });
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
        <Link to={`/produkter/${series.id}`}>{series.title}</Link>{" "}</Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>



      {isEditable && (
        <>
          {loggedInUser?.isAdminOrHmsUser && (
            <>
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
                {series.isPublished && (
                  <Link to={`${HM_REGISTER_URL()}/produkt/${series.id}`} target={"_blank"}>
                    <ExternalLinkIcon fontSize="1.5rem" title="Se serie på Finn Hjelpemiddel" />
                  </Link>
                )}
              </Table.DataCell>
            </>
          )}

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
        </>
      )}

    </Table.Row>
  );
};
