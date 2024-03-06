import { DelkontraktRegistrationDTO, ProductAgreementRegistrationDTOList } from "utils/types/response-types";
import { Button, Dropdown, ExpansionCard, HStack, Loader, Select, Table, VStack } from "@navikt/ds-react";
import { MenuElipsisVerticalIcon, PencilWritingIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import NewProductOnDelkontraktModal from "./NewProductOnDelkontraktModal";
import EditDelkontraktInfoModal from "./EditDelkontraktInfoModal";
import { changeRankOnProductAgreements, deleteProductsFromAgreement } from "api/AgreementProductApi";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import EditProducstVariantsModal from "./EditProductVariantsOnDelkontraktModal";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { deleteDelkontrakt } from "api/DelkontraktApi";
import { useProductAgreementsByDelkontraktId } from "utils/swr-hooks";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";

interface Props {
  agreementDraftStatus: string;
  delkontrakt: DelkontraktRegistrationDTO;
  mutateDelkontrakter: () => void;
}

export const Delkontrakt = ({ delkontrakt, mutateDelkontrakter, agreementDraftStatus }: Props) => {
  const {
    data: productAgreements,
    isLoading: productAgreementsIsLoading,
    mutateProductAgreements,
  } = useProductAgreementsByDelkontraktId(delkontrakt.id);

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [nyttProduktModalIsOpen, setNyttProduktModalIsOpen] = useState<boolean>(false);
  const [clickedSeriesId, setClickedSeriesId] = useState<string | null>(null);
  const [editDelkontraktModalIsOpen, setEditDelkontraktModalIsOpen] = useState<boolean>(false);
  const [deleteDelkontraktIsOpen, setDeleteDelkontraktIsOpen] = useState<boolean>(false);
  const [deleteProduktserieModalIsOpen, setDeleteProduktserieModalIsOpen] = useState<boolean>(false);
  const [produktserieToDelete, setProduktserieToDelete] = useState<ProductAgreementRegistrationDTOList>([]);
  const [produktserieToDeleteTitle, setProduktserieToDeleteTitle] = useState<string | null>(null);

  const [updatingRank, setUpdatingRank] = useState<boolean>(false);

  const { setGlobalError } = useHydratedErrorStore();

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

  const onConfirmDeleteProduktserie = () => {
    const productAgreementsToDelete = produktserieToDelete.map((variant) => {
      return variant.id;
    });

    deleteProductsFromAgreement(productAgreementsToDelete)
      .then(() => {
        mutateProductAgreements();
        mutateDelkontrakter();
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
    setDeleteProduktserieModalIsOpen(false);
  };

  const onChangeRangering = (productAgreementIds: string[], nyRangering: string) => {
    setUpdatingRank(true);
    changeRankOnProductAgreements(productAgreementIds, parseInt(nyRangering))
      .then(() => {
        mutateProductAgreements();
        setUpdatingRank(false);
      })
      .catch((error) => {
        mutateProductAgreements();
        setGlobalError(error.message);
        setUpdatingRank(false);
      });
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
      />
      <ConfirmModal
        title={`Slett produktserie '${produktserieToDeleteTitle}'`}
        text="Er du sikker på at du vil slette produktserie?"
        onClick={onConfirmDeleteProduktserie}
        onClose={() => {
          setDeleteProduktserieModalIsOpen(false);
        }}
        isModalOpen={deleteProduktserieModalIsOpen}
      />
      <NewProductOnDelkontraktModal
        modalIsOpen={nyttProduktModalIsOpen}
        setModalIsOpen={setNyttProduktModalIsOpen}
        delkontraktId={delkontrakt.id}
        post={delkontrakt!.delkontraktData.sortNr}
        mutateProductAgreements={mutateProductAgreements}
      />
      <EditProducstVariantsModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        variants={productAgreements?.find((it) => it.productSeries === clickedSeriesId)?.productVariants ?? []}
        mutateProductAgreements={mutateProductAgreements}
      />

      <ExpansionCard size="medium" key={delkontrakt!.delkontraktData.sortNr} aria-label="delkontrakt">
        <ExpansionCard.Header>
          <ExpansionCard.Title size="small">{delkontrakt!.delkontraktData.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content style={{ overflow: "auto" }}>
          <VStack gap="3">
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
                      <Table.HeaderCell scope="col"></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {productAgreements!.map((produkt, i) => {
                      return (
                        <Table.Row key={i} shadeOnHover={false}>
                          <Table.DataCell>
                            {produkt.serieIdentifier ? (
                              <a
                                href={`https://finnhjelpemiddel.nav.no/produkt/${produkt.serieIdentifier}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {produkt.productTitle}
                              </a>
                            ) : (
                              produkt.productTitle
                            )}
                          </Table.DataCell>
                          <Table.DataCell>
                            <Button
                              iconPosition="right"
                              variant={"tertiary"}
                              icon={<PencilWritingIcon title="Rediger" fontSize="1.2rem" />}
                              onClick={() => {
                                setClickedSeriesId(produkt.productSeries ? produkt.productSeries : "");
                                setModalIsOpen(true);
                              }}
                            >
                              {produkt.productVariants.length}
                            </Button>
                          </Table.DataCell>
                          <Table.DataCell>
                            {updatingRank ? (
                              <Loader></Loader>
                            ) : (
                              <Select
                                id="rangering"
                                name="rangering"
                                label={""}
                                value={produkt.rank}
                                onChange={(e) => {
                                  onChangeRangering(
                                    produkt.productVariants.map((variant) => variant.id),
                                    e.target.value,
                                  );
                                }}
                                style={{ width: "4em" }}
                              >
                                {range(MIN_RANGERING, MAX_RANGERING).map((it) => (
                                  <option key={it} value={it}>
                                    {it}
                                  </option>
                                ))}
                              </Select>
                            )}
                          </Table.DataCell>
                          <Table.DataCell>
                            <Button
                              iconPosition="right"
                              variant={"tertiary"}
                              icon={<TrashIcon title="Slett" fontSize="1.5rem" />}
                              onClick={() => {
                                setProduktserieToDelete(produkt.productVariants);
                                setProduktserieToDeleteTitle(produkt.productTitle);
                                setDeleteProduktserieModalIsOpen(true);
                              }}
                            />
                          </Table.DataCell>
                        </Table.Row>
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
                icon={<PlusCircleIcon title="Legg til produkt" fontSize="1.5rem" />}
                onClick={() => {
                  setNyttProduktModalIsOpen(true);
                }}
              >
                <span>Legg til Produkt</span>
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
                      disabled={agreementDraftStatus !== "DRAFT"}
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

function range(start: number, stop: number): number[] {
  const size = stop - start + 1;
  return [...Array(size).keys()].map((i) => i + start);
}

const MIN_RANGERING = 1;
const MAX_RANGERING = 9;
