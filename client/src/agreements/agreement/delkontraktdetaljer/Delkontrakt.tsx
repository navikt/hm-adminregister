import { DelkontraktRegistrationDTO, ProductAgreementRegistrationDTOList } from "utils/types/response-types";
import { Button, Checkbox, Dropdown, ExpansionCard, HStack, Switch, Table, VStack } from "@navikt/ds-react";
import { MenuElipsisVerticalIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import NewProductOnDelkontraktModal from "./NewProductOnDelkontraktModal";
import EditDelkontraktInfoModal from "./EditDelkontraktInfoModal";
import { deleteProductsFromAgreement } from "api/AgreementProductApi";
import { useErrorStore } from "utils/store/useErrorStore";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { deleteDelkontrakt } from "api/DelkontraktApi";
import { useProductAgreementsByDelkontraktId } from "utils/swr-hooks";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { DelkontraktSerieRow } from "agreements/agreement/delkontraktdetaljer/DelkontraktSerieRow";

interface Props {
  agreementDraftStatus: string;
  delkontrakt: DelkontraktRegistrationDTO;
  mutateDelkontrakter: () => void;
}

export const Delkontrakt = ({ delkontrakt, mutateDelkontrakter, agreementDraftStatus }: Props) => {
  const [showOnlyMainProducts, setShowOnlyMainProducts] = useState<boolean>(true);

  const {
    data: productAgreements,
    isLoading: productAgreementsIsLoading,
    mutateProductAgreements,
  } = useProductAgreementsByDelkontraktId(delkontrakt.id, showOnlyMainProducts);

  const [nyttProduktModalIsOpen, setNyttProduktModalIsOpen] = useState<boolean>(false);
  const [editDelkontraktModalIsOpen, setEditDelkontraktModalIsOpen] = useState<boolean>(false);
  const [deleteDelkontraktIsOpen, setDeleteDelkontraktIsOpen] = useState<boolean>(false);
  const [produktserierToDelete, setProduktserierToDelete] = useState<ProductAgreementRegistrationDTOList>([]);
  const [deleteProduktserierModalIsOpen, setDeleteProduktserierModalIsOpen] = useState<boolean>(false);

  const { setGlobalError } = useErrorStore();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const onConfirmDeleteDelkontrakt = () => {
    deleteDelkontrakt(delkontrakt.id)
      .then(() => {
        mutateDelkontrakter();
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
    setDeleteDelkontraktIsOpen(false);
  };

  const onConfirmDeleteProduktserier = () => {
    const productAgreementsToDelete = produktserierToDelete.map((variant) => {
      return variant.id;
    });

    deleteProductsFromAgreement(productAgreementsToDelete)
      .then(() => {
        setProduktserierToDelete([]);
        mutateProductAgreements();
        mutateDelkontrakter();
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
    setDeleteProduktserierModalIsOpen(false);
  };

  if (productAgreementsIsLoading) return <div>Loading...</div>;

  return (
    <>
      <EditDelkontraktInfoModal
        modalIsOpen={editDelkontraktModalIsOpen}
        setModalIsOpen={setEditDelkontraktModalIsOpen}
        delkontrakt={delkontrakt!}
        mutateDelkontrakt={mutateDelkontrakter}
      />
      <ConfirmModal
        title={`Slett '${delkontrakt!.delkontraktData.title}'`}
        text="Er du sikker på at du vil slette delkontrakten?"
        onClick={onConfirmDeleteDelkontrakt}
        onClose={() => {
          setDeleteDelkontraktIsOpen(false);
        }}
        isModalOpen={deleteDelkontraktIsOpen}
        confirmButtonText={"Slett"}
        variant="danger"
      />

      <ConfirmModal
        title={`Slett  ${produktserierToDelete.length} merkede varianter`}
        text="Er du sikker på at du vil slette produktserier?"
        onClick={onConfirmDeleteProduktserier}
        onClose={() => {
          setDeleteProduktserierModalIsOpen(false);
        }}
        isModalOpen={deleteProduktserierModalIsOpen}
        confirmButtonText="Slett"
        variant="danger"
      />
      <NewProductOnDelkontraktModal
        modalIsOpen={nyttProduktModalIsOpen}
        setModalIsOpen={setNyttProduktModalIsOpen}
        delkontraktId={delkontrakt.id}
        post={delkontrakt!.delkontraktData.sortNr}
        mutateProductAgreements={mutateProductAgreements}
      />

      <ExpansionCard size="medium" key={delkontrakt!.delkontraktData.sortNr} aria-label="delkontrakt">
        <ExpansionCard.Header>
          <ExpansionCard.Title size="small">{delkontrakt!.delkontraktData.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content style={{ overflow: "auto" }}>
          <VStack gap="3">
            <Switch checked={showOnlyMainProducts} onChange={(e) => setShowOnlyMainProducts(e.target.checked)}>
              Vis kun hovedprodukter
            </Switch>
            <b>Beskrivelse:</b>
            {delkontrakt!.delkontraktData.description}
            {productAgreements!.length > 0 && (
              <VStack gap="2">
                <RowBoxTable size="small">
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">Produkter</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Artikler.</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Rangering</Table.HeaderCell>
                      <Table.HeaderCell scope="col">Gyldighetsperiode</Table.HeaderCell>
                      <Table.HeaderCell scope="col"></Table.HeaderCell>
                      <Table.HeaderCell scope="col">
                        <Checkbox
                          checked={selectedRows.length === productAgreements?.length}
                          onChange={() => {
                            selectedRows.length
                              ? setSelectedRows([])
                              : setSelectedRows(
                                  productAgreements?.map(({ serieIdentifier }) => serieIdentifier!) ?? [],
                                );
                          }}
                          hideLabel
                        >
                          Velg alle rader
                        </Checkbox>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {productAgreements!
                      .filter((product) => {
                        if (showOnlyMainProducts) {
                          return !product.accessory && !product.sparePart;
                        } else {
                          return true;
                        }
                      })
                      .map((produkt, i) => {
                        return (
                          <DelkontraktSerieRow
                            key={produkt.serieIdentifier}
                            agreementDraftStatus={agreementDraftStatus}
                            mutateProductAgreements={mutateProductAgreements}
                            toggleSelectedRow={toggleSelectedRow}
                            selectedRows={selectedRows}
                            productVariantsOnSeries={produkt}
                            mutateDelkontrakter={mutateDelkontrakter}
                          />
                        );
                      })}
                  </Table.Body>
                </RowBoxTable>
              </VStack>
            )}

            <HStack>
              <Button
                className="fit-content"
                variant="tertiary"
                icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
                onClick={() => {
                  setNyttProduktModalIsOpen(true);
                }}
              >
                <span>Legg til Produkt</span>
              </Button>

              <Button
                className="fit-content"
                variant="tertiary"
                icon={<TrashIcon fontSize="1.5rem" aria-hidden />}
                disabled={selectedRows.length === 0}
                onClick={() => {
                  console.log(selectedRows);
                  setProduktserierToDelete(
                    productAgreements
                      ?.filter((it) => selectedRows.includes(it.productSeries!))
                      .flatMap((pa) => pa.productVariants) ?? [],
                  );
                  setDeleteProduktserierModalIsOpen(true);
                }}
              >
                <span>Slett merkede produkter</span>
              </Button>
              <Dropdown>
                <Button
                  style={{ marginLeft: "auto" }}
                  variant="tertiary"
                  icon={<MenuElipsisVerticalIcon title="Rediger" fontSize="1.5rem" />}
                  as={Dropdown.Toggle}
                ></Button>
                <Dropdown.Menu>
                  <Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.GroupedList.Item
                      onClick={() => {
                        setEditDelkontraktModalIsOpen(true);
                      }}
                    >
                      Endre tittel og beskrivelse
                    </Dropdown.Menu.GroupedList.Item>
                  </Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.Divider />
                  <Dropdown.Menu.List>
                    <Dropdown.Menu.List.Item
                      disabled={agreementDraftStatus !== "DRAFT" && productAgreements && productAgreements?.length > 0}
                      onClick={() => {
                        setDeleteDelkontraktIsOpen(true);
                      }}
                    >
                      Slett delkontrakt
                    </Dropdown.Menu.List.Item>
                  </Dropdown.Menu.List>
                </Dropdown.Menu>
              </Dropdown>
            </HStack>
          </VStack>
        </ExpansionCard.Content>
      </ExpansionCard>
    </>
  );
};
