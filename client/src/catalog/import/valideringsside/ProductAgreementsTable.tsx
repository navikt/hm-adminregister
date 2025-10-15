import { Table } from "@navikt/ds-react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";

export const ProductAgreementsTable = ({
  productAgreements,
}: {
  productAgreements: ProductAgreementRegistrationDTO[];
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
          {productAgreements &&
            productAgreements.length > 0 &&
            productAgreements.map((productAgreement, i) => (
              <Table.Row key={i}>
                <Table.DataCell>{productAgreement.title}</Table.DataCell>
                <Table.DataCell>{productAgreement.reference}</Table.DataCell>
                <Table.DataCell>{productAgreement.hmsArtNr}</Table.DataCell>
                <Table.DataCell>{productAgreement.post}</Table.DataCell>
              </Table.Row>
            ))}
        </Table.Body>
      </Table>
    </div>
  );
};
