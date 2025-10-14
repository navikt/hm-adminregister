import { ProductVariant } from "utils/types/types";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { Button, Table, BodyShort } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import { ProductRegistrationDTO } from "utils/types/response-types";


interface Props {
  products?: ProductRegistrationDTO[];
  showRemove?: boolean;
  onRemove?: (productId: string) => void;
}

const WorksWithVariantsTable = ({ products, showRemove = false, onRemove }: Props) => {
  const hasProducts = (products?.length || 0) > 0;
  return (
    <RowBoxTable size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Variantnavn</Table.HeaderCell>
          <Table.HeaderCell scope="col">HMS-artnr.</Table.HeaderCell>
            <Table.HeaderCell scope="col">Artlevnr.</Table.HeaderCell>
          {showRemove && <Table.HeaderCell scope="col">Fjern</Table.HeaderCell>}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {!hasProducts && (
          <Table.Row>
            <Table.DataCell colSpan={showRemove ? 4 : 3}>
              <BodyShort size="small">Ingen produkter er koblet til dette produktet.</BodyShort>
            </Table.DataCell>
          </Table.Row>
        )}
        {products?.map((product) => (
          <Table.Row key={product.id}>
            <Table.DataCell><div>{product.articleName}</div></Table.DataCell>
            <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
            <Table.DataCell>{product.supplierRef}</Table.DataCell>
            {showRemove && (
              <Table.DataCell style={{ width: "1%" }}>
                <Button
                  size="small"
                  variant="tertiary"
                  aria-label={`Fjern kobling for ${product.articleName}`}
                  style={{ padding: 4, minWidth: 0, width: 32, height: 32, display: "inline-flex", justifyContent: "center" }}
                  icon={<TrashIcon aria-hidden />}
                  onClick={() => onRemove?.(product.id)}
                />
              </Table.DataCell>
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </RowBoxTable>
  );
};

export default WorksWithVariantsTable;