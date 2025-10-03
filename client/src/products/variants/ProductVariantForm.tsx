import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, HelpText, HStack, Select, TextField } from "@navikt/ds-react";
import { updateProductVariant } from "api/ProductApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { isUUID, labelRequired } from "utils/string-util";
import { ProductRegistrationDTOV2, TechDataType } from "utils/types/response-types";
import styles from "./ProductVariantForm.module.scss";

type FormData = {
  articleName: string;
  supplierRef: string;
  hmsArtNr: string | null;
  techData: Array<{
    key: string;
    value: string;
    unit: string;
    type: TechDataType;
    definition?: string | null;
    options?: string[] | null;
  }>;
};

const ProductVariantForm = ({ product, mutate }: { product: ProductRegistrationDTOV2; mutate: () => void }) => {
  const navigate = useNavigate();
  const {
    articleName,
    supplierRef,
  } = product;
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

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
      hmsArtNr: product.hmsArtNr,
      supplierRef: isUUID(supplierRef) ? "" : supplierRef,
      techData: product.productData.techData,
    },
  });

  const { fields: techDataFields } = useFieldArray({ name: "techData", control });



  async function onSubmit(data: FormData) {
    const productRegistrationUpdated = {
      hmsArtNr: data.hmsArtNr,
      articleName: data.articleName,
      supplierRef: data.supplierRef,
      productData: {
        ...product.productData,
        techData: data.techData,
      },
    };

    updateProductVariant(loggedInUser?.isAdmin || false, product.id, productRegistrationUpdated)
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

  return (
    <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("articleName", { required: true })}
        label={labelRequired("Artikkelnavn")}
        id="articleName"
        name="articleName"
        type="text"
        defaultValue={product.articleName}
        error={errors?.articleName && "Artikkelnavn er påkrevd"}
      />
      <TextField
        {...register("supplierRef", { required: true })}
        label={labelRequired("Leverandør artikkelnummer")}
        id="supplierRef"
        name="supplierRef"
        type="text"
        error={errors?.supplierRef?.message || (errors?.supplierRef && "Artikkelnummer er påkrevd")}
        readOnly={!loggedInUser?.isAdmin && product.isPublished}
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
      {techDataFields.map((techDataField, index) => {
        const errorForField = errors?.techData?.[index]?.value;

        const label = techDataField?.definition ? (
          <HStack gap="1">
            {techDataField.key} <HelpText>{techDataField?.definition}</HelpText>{" "}
          </HStack>
        ) : (
          techDataField.key
        );

        return (
          <HStack key={`techdata-${techDataField.key}-${index}`} align="end" gap="2" wrap={false}>
            {techDataField.type === "NUMBER" && (
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
            )}
            {techDataField.type === "BOOLEAN" && (
              <Select {...register(`techData.${index}.value`)} label={label}>
                <option value="">Velg</option>
                <option value="Ja">Ja</option>
                <option value="Nei">Nei</option>
              </Select>
            )}
            {techDataField.type === "OPTIONS" && (
              <Select {...register(`techData.${index}.value`)} label={label}>
                <option value="">Velg</option>
                {techDataField.options?.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </Select>
            )}
            {techDataField.type === "TEXT" && (
              <TextField
                {...register(`techData.${index}.value`)}
                label={label}
                id={`techData.${index}.value`}
                name={`techData.${index}.value`}
                type="text"
                error={errorForField?.message}
              />
            )}
            <span className={styles.techDataUnit}>{techDataField.unit}</span>
          </HStack>
        );
      })}
      <div className="button-container">
        <Button
          type="reset"
          variant="secondary"
          size="medium"
          onClick={() => navigate(`/produkter/${product.seriesUUID}?tab=variants&page=${page}`)}
        >
          Avbryt
        </Button>
        <Button type="submit" size="medium">
          Lagre
        </Button>
      </div>
    </form>
  );
};

export default ProductVariantForm;
