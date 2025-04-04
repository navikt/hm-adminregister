import { Alert, Box, Button, HStack, Loader, Modal, Search, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { addCompatibleWithSeriesForParts, usePagedParts, usePartByVariantIdentifier } from "api/PartApi";
import { PartsToAddTable } from "parts/series/PartsToAddTable";
import styles from "./NewCompatiblePartsOnSeriesModal.module.scss";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  seriesId: string;
  mutateParts: () => void;
  seriesParts: string[];
}

const NewCompatiblePartsOnSeriesModal = ({
  modalIsOpen,
  setModalIsOpen,
  mutateParts,
  seriesId,
  seriesParts,
}: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [productIdsToAdd, setProductIdsToAdd] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleSelectedRow = (value: string) =>
    setProductIdsToAdd((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const { setGlobalError } = useErrorStore();

  const {
    data: pagedData,
    isLoading: isLoadingPagedData,
    error: errorPaged,
  } = usePagedParts({
    page: 0,
    pageSize: 100,
    titleSearchTerm: searchTerm,
  });

  const { data: partByVariantIdentifier } = usePartByVariantIdentifier(searchTerm);

  const resetModal = () => {
    setProductIdsToAdd([]);
    setSearchTerm("");
    setModalIsOpen(false);
  };

  async function onClickLeggTilKobling() {
    setIsSaving(true);
    if (productIdsToAdd.length > 0) {
      addCompatibleWithSeriesForParts(seriesId, productIdsToAdd).then(
        () => {
          mutateParts();
          setProductIdsToAdd([]);
          setIsSaving(false);
          setModalIsOpen(false);
        },
        (error) => {
          setGlobalError(error.message);
          setIsSaving(false);
        },
      );
    }
    resetModal();
  }

  return (
    <Modal
      open={modalIsOpen}
      onCancel={(e) => {}}
      header={{
        heading: "Legg til del",
        closeButton: true,
      }}
      onClose={() => {
        resetModal();
      }}
      className={styles.modal}
    >
      <Modal.Header closeButton={false}>
        <VStack gap="6">
          <Box role="search" style={{ maxWidth: "475px" }}>
            <Search
              className="search-button"
              label="Søk"
              variant="simple"
              clearButton={true}
              placeholder="Navn, hms-art nummer eller artikkelnummer"
              size="medium"
              value={searchTerm || ""}
              onChange={(value) => setSearchTerm(value)}
              hideLabel={false}
            />
          </Box>
          <HStack gap="2">
            <Button
              onClick={() => {
                onClickLeggTilKobling();
              }}
              disabled={productIdsToAdd.length === 0}
              variant="primary"
              type="button"
            >
              {`Legg til ${productIdsToAdd.length} deler`}
            </Button>
            <Button
              onClick={() => {
                resetModal();
              }}
              variant="secondary"
              type="reset"
            >
              Avbryt
            </Button>
            <Button
              onClick={() => {
                setProductIdsToAdd([]);
                setSearchTerm("");
              }}
              variant="secondary"
              type="reset"
            >
              Nullstill
            </Button>
          </HStack>
        </VStack>
      </Modal.Header>
      <Modal.Body>
        <div>
          <VStack gap={"2"}>
            {isSaving && (
              <HStack justify="center">
                <Loader size="2xlarge" title="venter..." />
              </HStack>
            )}
            <VStack gap="4">
              <VStack gap="1-alt">
                {isLoadingPagedData && <Loader />}
                {partByVariantIdentifier ? (
                  <PartsToAddTable
                    parts={[partByVariantIdentifier]}
                    selectedRows={productIdsToAdd}
                    toggleSelectedRow={toggleSelectedRow}
                    seriesParts={seriesParts}
                  />
                ) : pagedData && pagedData.content && pagedData?.content.length > 0 ? (
                  <PartsToAddTable
                    parts={pagedData.content}
                    selectedRows={productIdsToAdd}
                    toggleSelectedRow={toggleSelectedRow}
                    seriesParts={seriesParts}
                  />
                ) : (
                  !isLoadingPagedData && (
                    <Alert variant="info">
                      {searchTerm !== ""
                        ? `Ingen produkter funnet med søket: "${searchTerm}"`
                        : "Ingen produkter funnet."}
                    </Alert>
                  )
                )}
              </VStack>
            </VStack>
          </VStack>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default NewCompatiblePartsOnSeriesModal;
