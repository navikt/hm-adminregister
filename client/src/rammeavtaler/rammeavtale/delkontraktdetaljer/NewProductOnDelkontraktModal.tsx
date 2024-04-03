import { Button, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelRequired } from "utils/string-util";
import { createNewProductOnDelkontraktSchema } from "utils/zodSchema/newProductOnDelkontrakt";
import { getProductByHmsNr } from "api/ProductApi";
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

export type NewProductDelkontraktFormData = z.infer<typeof createNewProductOnDelkontraktSchema>;

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
    if (!productToAdd || productToAdd.hmsArtNr !== data.hmsNummer) {
      getProductByHmsNr(data.hmsNummer)
        .then((product) => {
          setProductToAdd(product);
          if (product.seriesId) {
            setProductToAddSeriesId(product.seriesId);
          }
        })
        .catch((error) => {
          setGlobalError(error.status, error.message);
        });
    }
  }

  async function onClickLeggTilValgteVarianter() {
    setIsSaving(true);

    addProductsToAgreement(
      delkontraktId,
      post,
      variants?.filter((variant) => variantsToAdd.includes(variant.hmsArtNr!!)) || [],
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
                {...register("hmsNummer", { required: true })}
                label={labelRequired("HMS-nummer")}
                id="hmsNummer"
                name="hmsNummer"
                type="text"
                error={errors?.hmsNummer?.message}
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
