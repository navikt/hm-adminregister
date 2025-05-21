import EditProductAgreementDateModal from "agreements/agreement/delkontraktdetaljer/EditProductAgreementDateModal";
import React, { useState } from "react";
import { ProductAgreementRegistrationDTOList, ProductVariantsForDelkontraktDto } from "utils/types/response-types";
import { BodyShort, Button, Checkbox, Loader, Select, Table } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { PencilWritingIcon, TrashIcon } from "@navikt/aksel-icons";
import { toPeriodString } from "utils/date-util";
import { range } from "lodash";
import { changeRankOnProductAgreements, deleteProductsFromAgreement } from "api/AgreementProductApi";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import EditProducstVariantsModal from "agreements/agreement/delkontraktdetaljer/EditProductVariantsOnDelkontraktModal";

interface Props {
  mutateProductAgreements: () => void;
  productVariantsOnSeries: ProductVariantsForDelkontraktDto;
  agreementDraftStatus: string;
  toggleSelectedRow: (id: string) => void;
  selectedRows: string[];
  mutateDelkontrakter: () => void;
}

export const DelkontraktSerieRow = ({
  mutateProductAgreements,
  productVariantsOnSeries,
  agreementDraftStatus,
  toggleSelectedRow,
  selectedRows,
  mutateDelkontrakter,
}: Props) => {
  const [editProductAgreementDateModalIsOpen, setEditProductAgreementDateModalIsOpen] = useState<boolean>(false);
  const [clickedSeriesId, setClickedSeriesId] = useState<string | null>(null);
  const [editProductsVariantsModalIsOpen, setEditProductsVariantsModalIsOpen] = useState<boolean>(false);
  const [produktserieToDelete, setProduktserieToDelete] = useState<ProductAgreementRegistrationDTOList>([]);
  const [produktserieToDeleteTitle, setProduktserieToDeleteTitle] = useState<string | null>(null);
  const [deleteProduktserieModalIsOpen, setDeleteProduktserieModalIsOpen] = useState<boolean>(false);

  const [updatingRank, setUpdatingRank] = useState<boolean>(false);

  const onChangeRangering = (productAgreementIds: string[], nyRangering: string) => {
    setUpdatingRank(true);
    changeRankOnProductAgreements(productAgreementIds, parseInt(nyRangering))
      .then(() => {
        mutateProductAgreements();
        setUpdatingRank(false);
      })
      .catch((error) => {
        mutateProductAgreements();
        setUpdatingRank(false);
      });
  };

  const onConfirmDeleteProduktserie = () => {
    const productAgreementsToDelete = produktserieToDelete.map((variant) => {
      return variant.id;
    });

    deleteProductsFromAgreement(productAgreementsToDelete)
      .then(() => {
        mutateProductAgreements();
      })
      .catch(() => {
        // Handle error
      });
    setDeleteProduktserieModalIsOpen(false);
  };

  return (
    <>
      <Table.Row key={productVariantsOnSeries.productSeries} shadeOnHover={false}>
        <Table.DataCell>
          <>
            <EditProductAgreementDateModal
              modalIsOpen={editProductAgreementDateModalIsOpen}
              setModalIsOpen={setEditProductAgreementDateModalIsOpen}
              mutateProductAgreements={mutateProductAgreements}
              productAgreementsToUpdate={productVariantsOnSeries.productVariants}
              mutateDelkontrakter={mutateDelkontrakter}
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
            <EditProducstVariantsModal
              modalIsOpen={editProductsVariantsModalIsOpen}
              setModalIsOpen={setEditProductsVariantsModalIsOpen}
              variants={productVariantsOnSeries.productVariants}
              mutateProductAgreements={mutateProductAgreements}
            />
          </>
          {productVariantsOnSeries.productSeries ? (
            <a
              href={`${HM_REGISTER_URL()}/produkt/${productVariantsOnSeries.productSeries}`}
              target="_blank"
              rel="noreferrer"
            >
              {productVariantsOnSeries.productTitle}
            </a>
          ) : (
            productVariantsOnSeries.productTitle
          )}
          {agreementDraftStatus !== "DRAFT" &&
            productVariantsOnSeries.productVariants.some((variant) => variant.status === "INACTIVE") &&
            " (Inaktive varianter)"}
        </Table.DataCell>
        <Table.DataCell>
          <Button
            iconPosition="right"
            variant={"tertiary"}
            icon={<PencilWritingIcon title="Rediger" fontSize="1.2rem" />}
            onClick={() => {
              setClickedSeriesId(productVariantsOnSeries.productSeries ? productVariantsOnSeries.productSeries : "");
              setEditProductsVariantsModalIsOpen(true);
            }}
          >
            {productVariantsOnSeries.productVariants.length}
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
              value={productVariantsOnSeries.rank}
              onChange={(e) => {
                onChangeRangering(
                  productVariantsOnSeries.productVariants.map((variant) => variant.id),
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
            variant={"tertiary"}
            onClick={() => {
              setClickedSeriesId(productVariantsOnSeries.productSeries ? productVariantsOnSeries.productSeries : "");
              setEditProductAgreementDateModalIsOpen(true);
            }}
            size="xsmall"
          >
            <BodyShort size="small">
              {toPeriodString(productVariantsOnSeries.published, productVariantsOnSeries.expired)}
            </BodyShort>
          </Button>
        </Table.DataCell>
        <Table.DataCell>
          <Button
            iconPosition="right"
            variant={"tertiary"}
            icon={<TrashIcon title="Slett" fontSize="1.5rem" />}
            onClick={() => {
              setProduktserieToDelete(productVariantsOnSeries.productVariants);
              setProduktserieToDeleteTitle(productVariantsOnSeries.productTitle);
              setDeleteProduktserieModalIsOpen(true);
            }}
          />
        </Table.DataCell>
        <Table.DataCell>
          <Checkbox
            hideLabel
            checked={selectedRows.includes(productVariantsOnSeries.productSeries!)}
            onChange={() => {
              toggleSelectedRow(productVariantsOnSeries.productSeries!);
            }}
            aria-labelledby={`id-${productVariantsOnSeries.productSeries}`}
          >
            {" "}
          </Checkbox>
        </Table.DataCell>
      </Table.Row>
    </>
  );
};

const MIN_RANGERING = 1;
const MAX_RANGERING = 20;
