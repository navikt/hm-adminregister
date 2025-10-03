import { ProductVariant } from "utils/types/types";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { Button, Table } from "@navikt/ds-react";
import { TrashIcon } from "@navikt/aksel-icons";
import { ProductRegistrationDTO, ProductRegistrationDTOV2 } from "utils/types/response-types";


interface Props {
  products?: ProductRegistrationDTO[];
  showRemove?: boolean;
  onRemove?: (productId: string) => void;
}

const WorksWithVariantsTable = ({ products, showRemove = false, onRemove }: Props) => (
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
      {products?.map((product) => (
        <Table.Row key={product.id}>
          <Table.DataCell>{product.articleName}</Table.DataCell>
          <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
          <Table.DataCell>{product.supplierRef}</Table.DataCell>
          {showRemove && (
            <Table.DataCell>
              <Button
                size="small"
                style={{ padding: "4px" }}
                icon={<TrashIcon />}
                onClick={() => onRemove?.(product.id)}
              />
            </Table.DataCell>
          )}
        </Table.Row>
      ))}
    </Table.Body>
  </RowBoxTable>
);

export default WorksWithVariantsTable;