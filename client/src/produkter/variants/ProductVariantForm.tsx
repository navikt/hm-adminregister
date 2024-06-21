import { Alert, Button, HelpText, HStack, Loader, Select, TextField, VStack } from "@navikt/ds-react";
import { updateProductVariant } from "api/ProductApi";
import { HM_REGISTER_URL } from "environments";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { isUUID, labelRequired } from "utils/string-util";
import { fetcherGET } from "utils/swr-hooks";
import { ProductRegistrationDTO, TechLabelDto } from "utils/types/response-types";
import styles from "./ProductVariantForm.module.scss";

type FormData = {
  articleName: string;
  supplierRef: string;
  hmsArtNr: string;
  techData: Array<{
    key: string;
    value: string;
    unit: string;
  }>;
};

const ProductVariantForm = ({ product, mutate }: { product: ProductRegistrationDTO; mutate: () => void }) => {
  const navigate = useNavigate();
  const {
    articleName,
    supplierRef,
    productData: { techData },
  } = product;
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  const { data: techLabels, isLoading: isLoadingTechLabels } = useSWR<TechLabelDto[]>(
    `${HM_REGISTER_URL()}/admreg/api/v1/techlabels/${product.isoCategory}`,
    fetcherGET,
  );

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    control,
    setError,
  } = useForm<FormData>({
    mode: "onTouched",
    defaultValues: {
      articleName,
      hmsArtNr: product.hmsArtNr ?? "",
      supplierRef: isUUID(supplierRef) ? "" : supplierRef,
      techData: product.productData.techData,
    },
  });

  const { fields: techDataFields } = useFieldArray({ name: "techData", control });

  async function onSubmit(data: FormData) {
    const productRegistrationUpdated = {
      ...product,
      articleName: data.articleName,
      supplierRef: data.supplierRef,
      hmsArtNr: data.hmsArtNr,
      productData: {
        ...product.productData,
        techData: data.techData,
      },
    };

    updateProductVariant(loggedInUser?.isAdmin || false, productRegistrationUpdated)
      .then((product) => {
        navigate(`/produkter/${product.seriesUUID}?tab=variants&page=${page}`);
        mutate();
      })
      .catch((error) => {
        if (error.message === "supplierIdRefId already exists") {
          setError("supplierRef", { type: "custom", message: "Artikkelnummeret finnes allerede på en annen variant" });
        } else {
          setGlobalError(error.status, error.message);
        }
      });
  }

  if (isLoadingTechLabels || !techLabels) {
    return (
      <VStack gap="8">
        <Loader />
      </VStack>
    );
  }

  const techLabelsMap = new Map(techLabels.map((x) => [x.label, x]));

  return (
    <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("articleName", { required: true })}
        label={labelRequired("Artikkelnavn")}
        id="articleName"
        name="articleName"
        type="text"
        defaultValue={product.articleName}
        error={errors?.articleName?.message}
      />
      <TextField
        {...register("supplierRef", { required: true })}
        label={labelRequired("Leverandør artikkelnummer")}
        id="supplierRef"
        name="supplierRef"
        type="text"
        error={errors?.supplierRef?.message}
        disabled={product.published !== undefined}
      />
      {loggedInUser?.isAdmin && (
        <TextField
          {...register("hmsArtNr")}
          label={"HMS nummer"}
          id="hmsArtNr"
          name="hmsArtNr"
          type="text"
          error={errors?.hmsArtNr?.message}
        />
      )}
      {techDataFields.length > 0 && (
        <Alert variant="info">
          {`Teknisk data opprettet basert på isokategori ${product.isoCategory} satt på produktet`}
        </Alert>
      )}
      {techDataFields.map((key, index) => {
        const errorForField = errors?.techData?.[index]?.value;
        const techDataType = techLabelsMap.get(key.key);

        const label = techDataType?.definition ? (
          <HStack gap="1">
            {key.key} <HelpText>{techDataType?.definition}</HelpText>{" "}
          </HStack>
        ) : (
          key.key
        );

        return (
          <HStack key={`techdata-${key.key}-${index}`} align="end" gap="2" wrap={false}>
            {techDataType?.type === "N" && `${key.key}` ? (
              <TextField
                {...register(`techData.${index}.value`, {
                  validate: (value) => value === "" || /^\d+([.,]\d+)?$/.test(value) || "Må være tall",
                })}
                label={label}
                id={`techData.${index}.value`}
                name={`techData.${index}.value`}
                type="text"
                error={errorForField?.message}
              />
            ) : techDataType?.type === "L" ? (
              <Select {...register(`techData.${index}.value`)} label={label}>
                <option value="">Velg</option>
                <option value="Ja">Ja</option>
                <option value="Nei">Nei</option>
              </Select>
            ) : techDataType?.type === "C" && techDataType?.options?.length > 0 ? (
              <Select {...register(`techData.${index}.value`)} label={label}>
                <option value="">Velg</option>
                {techDataType.options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : (
              <TextField
                {...register(`techData.${index}.value`)}
                label={label}
                id={`techData.${index}.value`}
                name={`techData.${index}.value`}
                type="text"
                error={errorForField?.message}
              />
            )}
            <span className={styles.techDataUnit}>{techData?.[index]?.unit}</span>
          </HStack>
        );
      })}
      <div className="button-container">
        <Button
          type="reset"
          variant="tertiary"
          size="medium"
          onClick={() => navigate(`/produkter/${product.seriesId}?tab=variants&page=${page}`)}
        >
          Avbryt
        </Button>
        <Button type="submit" size="medium" disabled={!isValid}>
          Lagre
        </Button>
      </div>
    </form>
  );
};

export default ProductVariantForm;
