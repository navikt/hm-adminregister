import { Table } from "@navikt/ds-react";
import { ProductRegistration } from "utils/types/response-types";

export const ProductRegistrationTable = ({ productRegistrations }: { productRegistrations: ProductRegistration[] }) => {
  return (
    <div className="agreement-variants-table">
      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader key={1}>HMS-nr</Table.ColumnHeader>
            <Table.ColumnHeader>Lev-artnr:</Table.ColumnHeader>
            <Table.ColumnHeader>Tittel</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {productRegistrations &&
            productRegistrations.length > 0 &&
            productRegistrations.map((productRegistration, i) => (
              <Table.Row key={i}>
                <Table.DataCell>{productRegistration.hmsArtNr}</Table.DataCell>
                <Table.DataCell>{productRegistration.supplierRef}</Table.DataCell>
                <Table.DataCell>{productRegistration.articleName}</Table.DataCell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </div>
  );
};
