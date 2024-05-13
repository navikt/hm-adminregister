import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, HStack, TextField, VStack } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { newProductVariantSchema } from "utils/zodSchema/newProduct";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { DraftVariantDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { fetcherGET } from "utils/swr-hooks";
import { isUUID, labelRequired } from "utils/string-util";
import { HM_REGISTER_URL } from "environments";
import { draftProductVariant, updateProductVariant } from "api/ProductApi";

type FormData = z.infer<typeof newProductVariantSchema>;

const OpprettProduktVariant = () => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { seriesId, productId } = useParams();

  const seriesIdPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/series/${seriesId}`;

  const { data: products, isLoading: isLoading } = useSWR<ProductRegistrationDTO[]>(
    loggedInUser ? seriesIdPath : null,
    fetcherGET,
  );
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(newProductVariantSchema),
    mode: "onSubmit",
  });

  if (isLoading) {
    return <></>;
  }

  const hasTechData = products![0].productData.techData.length > 0;

  const isFirstProductInSeries = products?.length === 1 && isUUID(products[0].supplierRef);

  async function onSubmit(data: FormData) {
    const navigateFn = (product: ProductRegistrationDTO) => {
      if (hasTechData) {
        navigate(
          `/produkter/${products![0].id}/rediger-variant/${product.id}?page=${Number(searchParams.get("page"))}`,
        );
      } else {
        navigate(`/produkter/${products![0].id}?tab=variants&page=${Number(searchParams.get("page"))}`);
      }
    };

    if (isFirstProductInSeries) {
      const updatedProduct = {
        ...products[0],
        articleName: data.articleName,
        supplierRef: data.supplierRef,
      };

      updateProductVariant(loggedInUser?.isAdmin || false, updatedProduct)
        .then(() => navigateFn(products![0]))
        .catch((error) => {
          if (error.message === "supplierIdRefId already exists") {
            setError("supplierRef", {
              type: "custom",
              message: "Artikkelnummeret finnes allerede på en annen variant",
            });
          } else {
            setGlobalError(error.status, error.message);
          }
        });
    } else {
      const newVariant: DraftVariantDTO = {
        articleName: data.articleName,
        supplierRef: data.supplierRef,
      };

      draftProductVariant(loggedInUser?.isAdmin || false, productId!, newVariant)
        .then(() => navigateFn(products![0]))
        .catch((error) => {
          if (error.message === "supplierIdRefId already exists") {
            setError("supplierRef", {
              type: "custom",
              message: "Artikkelnummeret finnes allerede på en annen variant",
            });
          } else {
            setGlobalError(error.status, error.message);
          }
        });
    }
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
                {hasTechData ? "Opprett og legg til mer info" : "Opprett"}
              </Button>
            </div>
          </form>
        </VStack>
      </HStack>
    </main>
  );
};

export default OpprettProduktVariant;
