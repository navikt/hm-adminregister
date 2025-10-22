import { Table } from "@navikt/ds-react";
import { CatalogImport } from "utils/types/response-types";

export const CatalogImportsTable = ({
  catalogImports,
}: {
  catalogImports: CatalogImport[];
}) => {
  return (
    <div className="variants-table">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Tittel</Table.ColumnHeader>
            <Table.ColumnHeader>Anbudsnummer</Table.ColumnHeader>
            <Table.ColumnHeader key={1}>HMS-nr</Table.ColumnHeader>
            <Table.ColumnHeader>Delkontrakt</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {catalogImports &&
            catalogImports.length > 0 &&
            catalogImports.map((catalogImport, i) => (
              <Table.Row key={i}>
                <Table.DataCell>{catalogImport.title}</Table.DataCell>
                <Table.DataCell>{catalogImport.reference}</Table.DataCell>
                <Table.DataCell>{catalogImport.hmsArtNr}</Table.DataCell>
                <Table.DataCell>{catalogImport.postNr}</Table.DataCell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </div>
  );
};
