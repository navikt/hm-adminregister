import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, HStack, TextField } from "@navikt/ds-react";
import classNames from "classnames";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isUUID, labelRequired } from "utils/string-util";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { productVariantSchema } from "utils/zodSchema/newProduct";
import { z } from "zod";
import styles from "../ProductVariantForm.module.scss";
import { updateProductVariant } from "api/ProductApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";

type FormData = z.infer<typeof productVariantSchema>;

const ProductVariantForm = ({
  product,
  registrationPath,
  mutate,
  firstTime,
}: {
  product: ProductRegistrationDTO;
  registrationPath: string;
  mutate: () => void;
  firstTime: boolean;
}) => {
  const navigate = useNavigate();
  const {
    articleName,
    supplierRef,
    productData: { techData },
  } = product;
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { loggedInUser } = useAuthStore();
  const [supplierRefExistsMessage, setSupplierRefExistsMessage] = useState<string | undefined>(undefined);
  const { setGlobalError } = useErrorStore();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isValid },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(productVariantSchema),
    mode: "onChange",
    defaultValues: {
      articleName,
      hmsArtNr: product.hmsArtNr ?? "",
      supplierRef: isUUID(supplierRef) ? "" : supplierRef,
      techData: product.productData.techData,
    },
  });

  const { fields: techDataFields, append, remove } = useFieldArray({ name: "techData", control });

  async function onSubmit(data: FormData) {
    const productRegistrationUpdated = {
      ...product,
      articleName: firstTime ? product.articleName : data.articleName,
      supplierRef: firstTime ? product.supplierRef : data.supplierRef,
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
          setSupplierRefExistsMessage("Artikkelnummeret finnes allerede på en annen variant");
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
        readOnly={firstTime}
        className={classNames({ readonly: firstTime })}
        defaultValue={product.articleName}
        error={errors?.articleName?.message}
      />
      <TextField
        {...register("supplierRef", { required: true })}
        label={labelRequired("Leverandør artikkelnummer")}
        id="supplierRef"
        name="supplierRef"
        type="text"
        readOnly={firstTime}
        className={classNames({ readonly: firstTime })}
        onChange={() => setSupplierRefExistsMessage(undefined)}
        error={errors?.supplierRef?.message || supplierRefExistsMessage}
      />
      <TextField
        {...register("hmsArtNr")}
        label={"HMS nummer"}
        id="hmsArtNr"
        name="hmsArtNr"
        type="text"
        error={errors?.hmsArtNr?.message}
      />
      {techDataFields.length > 0 && (
        <Alert variant="info">
          {firstTime
            ? `Teknisk data opprettet basert på isokategori ${product.isoCategory} satt på produktet`
            : "Teknisk data hentet inn fra tidligere opprettet artikkel."}
        </Alert>
      )}
      {techDataFields.map((key, index) => {
        const errorForField = errors?.techData?.[index]?.value;
        return (
          <HStack key={`techdata-${key.key}-${index}`} align="end" gap="2" wrap={false}>
            <TextField
              {...register(`techData.${index}.value`, { required: false })}
              label={`${key.key}`}
              id={`techData.${index}.value`}
              name={`techData.${index}.value`}
              type="text"
              error={errorForField?.message}
            />
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
          {firstTime ? "Hopp over" : "Avbryt"}
        </Button>
        <Button type="submit" size="medium" disabled={!isValid}>
          Lagre
        </Button>
      </div>
      {error?.name && (
        <p>
          <span className="auth-dialog-box__error-message">{error?.message}</span>
        </p>
      )}
    </form>
  );
};

export default ProductVariantForm;
