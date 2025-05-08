import { Checkbox, Table } from "@navikt/ds-react";
import React from "react";
import { ProductRegistrationDTOV2 } from "utils/types/response-types";
import { Link } from "react-router-dom";
import { ExternalLinkIcon } from "@navikt/aksel-icons";

interface PartsToAddTableProps {
  parts: ProductRegistrationDTOV2[];
  selectedRows: string[];
  toggleSelectedRow: (id: string) => void;
  seriesParts: string[];
}

export const PartsToAddTable = ({ parts, selectedRows, toggleSelectedRow, seriesParts }: PartsToAddTableProps) => {
  return (
    <Table size="small">
      <Table.Header>
        <Table.Row key={"header"}>
          <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
          <Table.HeaderCell scope="col">HMS-nummer</Table.HeaderCell>
          <Table.HeaderCell scope="col">Leverandør art. nr.</Table.HeaderCell>
          <Table.HeaderCell scope="col"></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {parts.map((part) => (
          <Table.Row key={`${part.id}`} shadeOnHover={true}>
            <Table.DataCell>
              <>
                <Link target="_blank" to={`/del/${part.id}`}>
                  {part.articleName} <ExternalLinkIcon title="Se delside" />
                </Link>{" "}
              </>
            </Table.DataCell>
            <Table.DataCell>{part.hmsArtNr}</Table.DataCell>
            <Table.DataCell>{part.supplierRef}</Table.DataCell>
            <Table.DataCell>
              <Checkbox
                hideLabel
                checked={selectedRows.includes(part.id) || seriesParts.includes(part.id)}
                disabled={seriesParts.includes(part.id)}
                onChange={() => {
                  toggleSelectedRow(part.id!);
                }}
              >
                {" "}
              </Checkbox>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
