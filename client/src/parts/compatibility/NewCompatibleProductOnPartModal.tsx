import { BodyLong, Button, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { labelRequired } from "utils/string-util";
import { ProductRegistrationDTOV2 } from "utils/types/response-types";
import Content from "felleskomponenter/styledcomponents/Content";
import { addCompatibleWithVariant, getProductByHmsArtNr, getProductByHmsArtNrOrSupplierRef } from "api/PartApi";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  partId: string;
  mutatePart: () => void;
}

const NewCompatibleProductOnPartModal = ({ modalIsOpen, setModalIsOpen, mutatePart, partId }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [productIdToAdd, setProductIdToAdd] = useState<string | undefined>(undefined);
  const [productToAdd, setProductToAdd] = useState<ProductRegistrationDTOV2 | undefined>(undefined);
  const [productToAddError, setProductToAddError] = useState<string | undefined>(undefined);
  const { setGlobalError } = useErrorStore();

  async function onClickGetProduct() {
    if (productIdToAdd !== undefined) {
      getProductByHmsArtNr(productIdToAdd)
        .then((product) => {
          setProductToAdd(product);
          setProductToAddError(undefined);
        })
        .catch((error) => {
          setProductToAdd(undefined);
          setProductToAddError("Fant ikke produkt");
        });
    }
  }

  async function onClickLeggTilKobling() {
    setIsSaving(true);
    if (productToAdd !== undefined) {
      addCompatibleWithVariant(partId, productToAdd.id)
        .then(() => {
          mutatePart();
          setIsSaving(false);
        })
        .catch((error) => {
          setGlobalError(error.message);
          setIsSaving(false);
        });
      setIsSaving(false);
      setProductIdToAdd(undefined);
      setProductToAdd(undefined);
      setModalIsOpen(false);
    }
  }

  return (
    <Modal
      open={modalIsOpen}
      onCancel={(e) => {}}
      header={{
        heading: "Legg til produkt",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap={"2"} style={{ width: "100%" }}>
            <TextField
              label={labelRequired("HMS-nummer")}
              id="identifier"
              type="text"
              error={productToAddError}
              value={productIdToAdd || ""}
              onChange={(e) => setProductIdToAdd(e.target.value)}
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
              Hent produkt
            </Button>
            {isSaving && (
              <HStack justify="center">
                <Loader size="2xlarge" title="venter..." />
              </HStack>
            )}
            {productToAdd && (
              <VStack gap="5">
                <BodyLong>{productToAdd.articleName}</BodyLong>
              </VStack>
            )}
          </VStack>
        </Content>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setModalIsOpen(false);
            setProductToAdd(undefined);
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
          disabled={productToAdd === undefined}
          variant="primary"
          type="button"
        >
          Legg til kobling
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewCompatibleProductOnPartModal;
