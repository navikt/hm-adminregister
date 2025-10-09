import { BodyShort, Box, Button, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { labelRequired } from "utils/string-util";
import { ProductRegistrationDTO } from "utils/types/response-types";
import Content from "felleskomponenter/styledcomponents/Content";
import { TrashIcon } from "@navikt/aksel-icons";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import { useAuthStore } from "utils/store/useAuthStore";
import { addWorksWithVariantList } from "api/WorksWithApi";
import { getProductByVariantId } from "api/ProductApi";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  productId: string;
  mutateProduct: () => void;
}

const NewWorksWithProductOnProductModal = ({ modalIsOpen, setModalIsOpen, mutateProduct, productId }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [productIdsToAdd, setProductIdsToAdd] = useState<string[]>([]);
  const [productsToAdd, setProductsToAdd] = useState<ProductRegistrationDTO[]>([]);

  const [productIdToAdd, setProductIdToAdd] = useState<string | undefined>(undefined);
  const [productToAddError, setProductToAddError] = useState<string | undefined>(undefined);
  const { setGlobalError } = useErrorStore();
  const loggedInUser = useAuthStore().loggedInUser;
  const isAdmin = loggedInUser?.isAdminOrHmsUser || false;

  const resetModal = () => {
    setProductIdToAdd(undefined);
    setProductsToAdd([]);
    setProductIdsToAdd([]);
    setProductToAddError(undefined);
    setModalIsOpen(false);
  };

  async function onClickGetProduct() {
    if (productIdToAdd !== undefined && !productIdsToAdd.includes(productIdToAdd)) {
      getProductByVariantId(productIdToAdd)
        .then((product) => {
          // Prevent connecting a product to itself
          if (product.id === productId) {
            setProductToAddError("Kan ikke koble produkt til seg selv");
            return;
          }
          if (!productIdsToAdd.includes(product.hmsArtNr!)) {
            setProductIdsToAdd([...productIdsToAdd, product.hmsArtNr!]);
          }
          if (!productsToAdd.includes(product)) {
            setProductsToAdd([...productsToAdd, product]);
          }
          setProductToAddError(undefined);
          setProductIdToAdd(undefined);
        })
        .catch(() => {
          setProductToAddError(`Fant ikke produkt for HMS-nummer ${productIdToAdd}`);
        });
    } else if (productIdToAdd !== undefined && productIdsToAdd.includes(productIdToAdd)) {
      setProductToAddError("Produktet er allerede lagt til");
    }
  }

  async function onClickLeggTilKobling() {
    setIsSaving(true);
    if (productsToAdd.length > 0) {
      addWorksWithVariantList(productId, productsToAdd.map((product) => product.id)).then(
        () => {
          mutateProduct();
          setIsSaving(false);
          setProductIdToAdd(undefined);
          setProductsToAdd([]);
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
        heading: "Legg til produkt",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap="4" style={{ width: "100%" }}>
              <TextField
                label={labelRequired("HMS-nummer eller levartnr.")}
                hideLabel={false}
                id="identifier"
                type="text"
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
            {productToAddError && <BodyShort style={{ color: "red" }}>{productToAddError}</BodyShort>}
            {isSaving && (
              <HStack justify="center">
                <Loader size="2xlarge" title="venter..." />
              </HStack>
            )}
            {productsToAdd.length > 0 && (
              <VStack gap="2">
                {productsToAdd.map((product: ProductRegistrationDTO) => (
                  <HStack key={product.id} width="100%" align="center" gap="2">
                    <Box
                      key={product.id}
                      background="surface-success-subtle"
                      padding="2"
                      flexGrow="1"
                      style={{ borderRadius: "10px" }}
                    >
                      <DefinitionList horizontal fullWidth key={product.id}>
                        <DefinitionList.Term>Navn</DefinitionList.Term>
                        <DefinitionList.Definition>{product.articleName}</DefinitionList.Definition>
                        <DefinitionList.Term>HMS-artnr</DefinitionList.Term>
                        <DefinitionList.Definition>{product.hmsArtNr}</DefinitionList.Definition>
                      </DefinitionList>
                    </Box>
                    <Button
                      icon={<TrashIcon />}
                      variant="tertiary"
                      onClick={() => {
                        setProductsToAdd(productsToAdd.filter((p) => p.id !== product.id));
                        setProductIdsToAdd(productIdsToAdd.filter((id) => id !== product.hmsArtNr!));
                      }}
                    />
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </Content>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setModalIsOpen(false);
            resetModal();
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
          disabled={productsToAdd.length === 0}
          variant="primary"
          type="button"
        >
          Legg til koblinger
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewWorksWithProductOnProductModal;
