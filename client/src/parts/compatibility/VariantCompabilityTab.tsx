import { BodyLong, Button, Checkbox, HStack, Table, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { CompatibleVariantRow } from "parts/compatibility/CompatibleVariantRow";
import NewCompatibleProductOnPartModal from "parts/compatibility/NewCompatibleProductOnPartModal";
import { removeCompatibleWithVariant } from "api/PartApi";

interface VariantCompabilityTabProps {
  partId: string;
  productIds: string[];
  mutatePart: () => void;
}

export const VariantCompabilityTab = ({ partId, productIds, mutatePart }: VariantCompabilityTabProps) => {
  const [newCompatibleProductModalIsOpen, setNewCompatibleProductModalIsOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const deleteMarkedCompatibleProducts = () => {
    removeCompatibleWithVariant(partId, selectedRows).then(() => {
      mutatePart();
      setSelectedRows([]);
    });
  };

  return (
    <>
      <NewCompatibleProductOnPartModal
        modalIsOpen={newCompatibleProductModalIsOpen}
        setModalIsOpen={setNewCompatibleProductModalIsOpen}
        partId={partId}
        mutatePart={mutatePart}
      />
      <VStack padding={"8"} gap={"2"}>
        {productIds.length === 0 && <BodyLong>Ingen koblinger til varianter</BodyLong>}
        <Button
          className="fit-content"
          variant="primary"
          icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
          onClick={() => {
            setNewCompatibleProductModalIsOpen(true);
          }}
        >
          Legg til kobling
        </Button>
        {productIds.length > 0 && (
          <VStack gap={"2"}>
            <HStack gap={"2"}>
              {productIds.length > 0 && (
                <RowBoxTable>
                  <Table.Header>
                    <Table.Row key={"header"}>
                      <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                      <Table.HeaderCell scope="col">HMS-nummer</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Leverandør</Table.HeaderCell>
                      <Table.HeaderCell scope="col">
                        <Checkbox
                          checked={selectedRows.length === productIds.length}
                          onChange={() => {
                            if (selectedRows.length) {
                              setSelectedRows([]);
                            } else {
                              setSelectedRows(productIds);
                            }
                          }}
                          hideLabel
                        >
                          Velg alle rader
                        </Checkbox>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {productIds.map((productId) => (
                      <CompatibleVariantRow
                        productId={productId}
                        key={productId}
                        selectedRows={selectedRows}
                        toggleSelectedRow={toggleSelectedRow}
                      />
                    ))}
                  </Table.Body>
                </RowBoxTable>
              )}
            </HStack>
            <HStack justify={"end"}>
              <Button
                className="fit-content"
                variant="tertiary"
                icon={<TrashIcon fontSize="1.5rem" aria-hidden />}
                disabled={selectedRows.length === 0}
                onClick={deleteMarkedCompatibleProducts}
              >
                <span>Slett merkede koblinger</span>
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </>
  );
};
