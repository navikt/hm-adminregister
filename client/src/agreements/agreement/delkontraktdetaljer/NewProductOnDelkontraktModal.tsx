import { Button, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelRequired } from "utils/string-util";
import { createNewProductOnDelkontraktSchema } from "utils/zodSchema/newProductOnDelkontrakt";
import { getProductByHmsNr, getProductByVariantId } from "api/ProductApi";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { VarianterOnDelkontraktListe } from "./VarianterOnDelkontraktListe";
import { addProductsToAgreement } from "api/AgreementProductApi";
import { useProductVariantsBySeriesId } from "utils/swr-hooks";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  delkontraktId: string;
  post: number;
  mutateProductAgreements: () => void;
}

type NewProductDelkontraktFormData = z.infer<typeof createNewProductOnDelkontraktSchema>;

const NewProductOnDelkontraktModal = ({
  modalIsOpen,
  setModalIsOpen,
  mutateProductAgreements,
  delkontraktId,
  post,
}: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [productToAdd, setProductToAdd] = useState<ProductRegistrationDTO | undefined>(undefined);
  const [productToAddSeriesId, setProductToAddSeriesId] = useState<string | undefined>(undefined);
  const [variantsToAdd, setVariantsToAdd] = useState<string[]>([]);
  const { data: variants, isLoading } = useProductVariantsBySeriesId(productToAddSeriesId);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NewProductDelkontraktFormData>({
    resolver: zodResolver(createNewProductOnDelkontraktSchema),
    mode: "onSubmit",
  });
  const { setGlobalError } = useErrorStore();

  async function onClickGetProduct(data: NewProductDelkontraktFormData) {
    if (!productToAdd || productToAdd.hmsArtNr !== data.identifikator && productToAdd.supplierRef !== data.identifikator) {
      getProductByVariantId(data.identifikator)
        .then((product) => {
          setProductToAdd(product);
          if (product.seriesUUID) {
            setProductToAddSeriesId(product.seriesUUID);
          }
        })
        .catch((error) => {
          if(error.status !== 404) {
            setGlobalError(error.status, error.message);
          }

        });
    }
  }

  async function onClickLeggTilValgteVarianter() {
    setIsSaving(true);

    addProductsToAgreement(
      delkontraktId,
      post,
      variants?.filter((variant) => variantsToAdd.includes(variant.supplierRef!)) || [],
    )
      .then((agreement) => {
        mutateProductAgreements();
        setIsSaving(false);
      })
      .catch((error) => {
        setGlobalError(error.message);
        setIsSaving(false);
      });
    setIsSaving(false);
    reset();
    setVariantsToAdd([]);
    setProductToAdd(undefined);
    setModalIsOpen(false);
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
      <form>
        <Modal.Body>
          <Content>
            <VStack gap={"2"} style={{ width: "100%" }}>
              <TextField
                {...register("identifikator", { required: true })}
                label={labelRequired("HMS-nummer/Levart nr.")}
                id="identifikator"
                name="identifikator"
                type="text"
                error={errors?.identifikator?.message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    onClickGetProduct({ identifikator: e.currentTarget.value });
                  }
                }}
              />
              <Button
                onClick={handleSubmit(onClickGetProduct)}
                type="button"
                variant="secondary"
                style={{ marginLeft: "auto" }}
              >
                Hent produkt
              </Button>
              {isSaving && (
                <HStack justify="center">
                  <Loader size="2xlarge" title="venter..." />
                </HStack>
              )}
              {productToAdd && (
                <VStack gap="5">
                  <VarianterOnDelkontraktListe
                    setValgteRader={setVariantsToAdd}
                    product={productToAdd}
                    variants={variants || []}
                    seriesId={productToAddSeriesId}
                  />
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
              setVariantsToAdd([]);
              reset();
            }}
            variant="tertiary"
            type="reset"
          >
            Avbryt
          </Button>
          <Button
            onClick={() => {
              onClickLeggTilValgteVarianter();
            }}
            disabled={variantsToAdd.length === 0}
            variant="primary"
            type="button"
          >
            Legg til avhukede varianter
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default NewProductOnDelkontraktModal;
