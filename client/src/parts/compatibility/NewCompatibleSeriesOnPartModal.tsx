import { Box, Button, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { labelRequired } from "utils/string-util";
import { SeriesSearchDTO } from "utils/types/response-types";
import Content from "felleskomponenter/styledcomponents/Content";
import { addCompatibleWithSeries } from "api/PartApi";
import { getSeriesByVariantId } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  partId: string;
  mutatePart: () => void;
}

const NewCompatibleSeriesOnPartModal = ({ modalIsOpen, setModalIsOpen, mutatePart, partId }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [seriesToAdd, setSeriesToAdd] = useState<SeriesSearchDTO | undefined>(undefined);
  const [identifierToAdd, setIdentifierToAdd] = useState<string | undefined>(undefined);

  const [productToAddError, setProductToAddError] = useState<string | undefined>(undefined);
  const { setGlobalError } = useErrorStore();
  const loggedInUser = useAuthStore().loggedInUser;
  const isAdmin = loggedInUser?.isAdminOrHmsUser || false;

  async function onClickGetProduct() {
    if (identifierToAdd !== undefined) {
      getSeriesByVariantId(identifierToAdd)
        .then((series) => {
          setSeriesToAdd(series);
          setProductToAddError(undefined);
        })
        .catch((error) => {
          setSeriesToAdd(undefined);
          setProductToAddError("Fant ikke produkt");
        });
    }
  }

  async function onClickLeggTilKobling() {
    setIsSaving(true);
    if (seriesToAdd !== undefined) {
      addCompatibleWithSeries(partId, seriesToAdd.id, isAdmin)
        .then(() => {
          mutatePart();
          setIsSaving(false);
        })
        .catch((error) => {
          setGlobalError(error.message);
          setIsSaving(false);
        });
      setIsSaving(false);
      setSeriesToAdd(undefined);
      setIdentifierToAdd(undefined);
      setModalIsOpen(false);
    }
  }

  return (
    <Modal
      open={modalIsOpen}
      onCancel={(e) => {}}
      header={{
        heading: "Legg til serie",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap={"2"} style={{ width: "100%" }}>
            <TextField
              label={labelRequired("HMS-nummer eller levartnr.")}
              id="identifier"
              type="text"
              error={productToAddError}
              value={identifierToAdd || ""}
              onChange={(e) => setIdentifierToAdd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  onClickGetProduct();
                }
              }}
            />
            <Button onClick={onClickGetProduct} type="button" variant="secondary" style={{ marginLeft: "auto" }}>
              Hent serie
            </Button>
            {isSaving && (
              <HStack justify="center">
                <Loader size="2xlarge" title="venter..." />
              </HStack>
            )}
            {seriesToAdd && (
              <VStack gap="5">
                <Box
                  key={seriesToAdd.id}
                  background="surface-success-subtle"
                  padding="2"
                  flexGrow="1"
                  style={{ borderRadius: "10px" }}
                >
                  <DefinitionList horizontal fullWidth key={seriesToAdd.id}>
                    <DefinitionList.Term>Navn</DefinitionList.Term>
                    <DefinitionList.Definition>{seriesToAdd.title}</DefinitionList.Definition>
                  </DefinitionList>
                </Box>
              </VStack>
            )}
          </VStack>
        </Content>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setModalIsOpen(false);
            setSeriesToAdd(undefined);
          }}
          variant="tertiary"
          type="reset"
        >
          Avbryt
        </Button>
        <Button
          onClick={() => {
            onClickLeggTilKobling();
          }}
          disabled={seriesToAdd === undefined}
          variant="primary"
          type="button"
        >
          Legg til kobling
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewCompatibleSeriesOnPartModal;
