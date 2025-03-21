import { DelkontraktRegistrationDTO, ProductAgreementRegistrationDTOList } from "utils/types/response-types";
import {
  BodyShort,
  Button,
  Checkbox,
  Dropdown,
  ExpansionCard,
  HStack,
  Loader,
  Select,
  Switch,
  Table,
  VStack,
} from "@navikt/ds-react";
import { MenuElipsisVerticalIcon, PencilWritingIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import React, { useState } from "react";
import NewProductOnDelkontraktModal from "./NewProductOnDelkontraktModal";
import EditDelkontraktInfoModal from "./EditDelkontraktInfoModal";
import { changeRankOnProductAgreements, deleteProductsFromAgreement } from "api/AgreementProductApi";
import { useErrorStore } from "utils/store/useErrorStore";
import EditProducstVariantsModal from "./EditProductVariantsOnDelkontraktModal";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { deleteDelkontrakt } from "api/DelkontraktApi";
import { useProductAgreementsByDelkontraktId } from "utils/swr-hooks";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { HM_REGISTER_URL } from "environments";

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
  const [produktserierToDelete, setProduktserierToDelete] = useState<ProductAgreementRegistrationDTOList>([]);
  const [deleteProduktserierModalIsOpen, setDeleteProduktserierModalIsOpen] = useState<boolean>(false);

  const [updatingRank, setUpdatingRank] = useState<boolean>(false);

  const [showOnlyMainProducts, setShowOnlyMainProducts] = useState<boolean>(true);

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

  const publishedDate = productAgreements?.[0]?.productVariants?.[0]?.published;
  const expiredDate = productAgreements?.[0]?.productVariants?.[0]?.expired;
  const publishedDate_ = publishedDate ? new Date(publishedDate) : undefined;
  const expiredDate_ = expiredDate ? new Date(expiredDate) : undefined;

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
        title={`Slett produktserie '${produktserieToDeleteTitle}'`}
        text="Er du sikker på at du vil slette produktserie?"
        onClick={onConfirmDeleteProduktserie}
        onClose={() => {
          setDeleteProduktserieModalIsOpen(false);
        }}
        isModalOpen={deleteProduktserieModalIsOpen}
        confirmButtonText="Slett"
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
      <EditProducstVariantsModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        variants={productAgreements?.find((it) => it.productSeries === clickedSeriesId)?.productVariants ?? []}
        mutateProductAgreements={mutateProductAgreements}
      />

      <ExpansionCard size="medium" key={delkontrakt!.delkontraktData.sortNr} aria-label="delkontrakt">
        <ExpansionCard.Header>
          <ExpansionCard.Title size="small">{delkontrakt!.delkontraktData.title}</ExpansionCard.Title>
          {`${publishedDate_?.toLocaleDateString()} - ${expiredDate_?.toLocaleDateString()}`}
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
                          <Table.Row key={i} shadeOnHover={false}>
                            <Table.DataCell>
                              {produkt.serieIdentifier ? (
                                <a
                                  href={`${HM_REGISTER_URL()}/produkt/${produkt.serieIdentifier}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {produkt.productTitle}
                                </a>
                              ) : (
                                produkt.productTitle
                              )}
                              {agreementDraftStatus !== "DRAFT" &&
                                produkt.productVariants.some((variant) => variant.status === "INACTIVE") &&
                                " (Inaktive varianter)"}
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
                                  aria-label="Rangering"
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
                                  <option key={99} value={99}>
                                    -
                                  </option>
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
                                  ("");
                                }}
                              />
                            </Table.DataCell>
                            <Table.DataCell>
                              <Checkbox
                                hideLabel
                                checked={selectedRows.includes(produkt.serieIdentifier!)}
                                onChange={() => {
                                  toggleSelectedRow(produkt.serieIdentifier!);
                                }}
                                aria-labelledby={`id-${produkt.serieIdentifier}`}
                              >
                                {" "}
                              </Checkbox>
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
                  setProduktserierToDelete(
                    productAgreements
                      ?.filter((it) => selectedRows.includes(it.serieIdentifier!))
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

function range(start: number, stop: number): number[] {
  const size = stop - start + 1;
  return [...Array(size).keys()].map((i) => i + start);
}

const MIN_RANGERING = 1;
const MAX_RANGERING = 20;
