import { useSeriesV2Conditional } from "api/SeriesApi";
import { Checkbox, Loader, Table } from "@navikt/ds-react";
import React from "react";
import { useAuthStore } from "utils/store/useAuthStore";

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

  const loggedInUser = useAuthStore().loggedInUser;
  const isAdmin = loggedInUser?.isAdminOrHmsUser || false;


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
      <Table.DataCell>{series.title} </Table.DataCell>
      <Table.DataCell>{series.supplierName}</Table.DataCell>
      {isEditable && (
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
      )}

    </Table.Row>
  );
};
