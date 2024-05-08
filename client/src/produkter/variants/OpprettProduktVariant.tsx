import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, HStack, TextField, VStack } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createNewProductSchema, newProductVariantSchema } from "utils/zodSchema/newProduct";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { DraftVariantDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { draftProductVariantV2 } from "api/ProductApi";
import { useState } from "react";

type FormData = z.infer<typeof newProductVariantSchema>;

const OpprettProduktVariant = () => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { seriesId } = useParams();

  const [supplierRefExistsMessage, setSupplierRefExistsMessage] = useState<string | undefined>(undefined);

  const {
    handleSubmit,
    register,
    formState: { errors, isValid},
    setError
  } = useForm<FormData>({
    resolver: zodResolver(createNewProductSchema),
    mode: "onSubmit",
  });

  async function onSubmit(data: FormData) {
    const newVariant: DraftVariantDTO = {
      articleName: data.articleName,
      supplierRef: data.supplierRef,
    };

    draftProductVariantV2(loggedInUser?.isAdmin || false, seriesId!, newVariant)
      .then((product) =>
        navigate(`/produkter/${seriesId}/rediger-variant/${product.id}?page=${Number(searchParams.get("page"))}`),
      )
      .catch((error) => {
        if (error.message === "supplierIdRefId already exists") {
          setError("supplierRef", { type: "custom", message: "Artikkelnummeret finnes allerede på en annen variant" });
        } else {
          setGlobalError(error.status, error.message);
        }
      });
  }

  return (
    <main>
      <HStack justify="center" className="create-variant-page">
        <VStack gap="8">
          <Heading level="1" size="large" align="start">
            Legg til variant
          </Heading>

          <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("articleName", { required: true })}
              label={labelRequired("Variantnavn")}
              id="articleName"
              name="articleName"
              type="text"
              error={errors?.articleName?.message}
            />
            <TextField
              {...register("supplierRef", { required: true })}
              label={labelRequired("Leverandør artikkelnummer")}
              id="supplierRef"
              name="supplierRef"
              type="text"
              error={errors?.supplierRef?.message}
            />

            <div className="button-container">
              <Button type="reset" variant="tertiary" size="medium" onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type="submit" size="medium" disabled={!isValid}>
                Opprett og legg til mer info
              </Button>
            </div>
          </form>
        </VStack>
      </HStack>
    </main>
  );
};

export default OpprettProduktVariant;
