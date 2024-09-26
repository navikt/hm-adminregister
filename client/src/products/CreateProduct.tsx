import { Box, Button, HStack, TextField, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { useErrorStore } from "utils/store/useErrorStore";
import { useIsoCategories, useSuppliers } from "utils/swr-hooks";
import { useNavigate } from "react-router-dom";
import { SeriesDraftWithDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { draftNewSeries, draftNewSeriesForAdmin } from "api/SeriesApi";
import FormBox from "felleskomponenter/FormBox";
import { PackageIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import IsoComboboxProvider from "products/iso-combobox/IsoComboboxProvider";
import { useAuthStore } from "utils/store/useAuthStore";

type Error = {
  titleErrorMessage?: string | undefined;
  isoCodeErrorMessage?: string | undefined;
  supplierErrorMessage?: string | undefined;
};

export default function CreateProduct() {
  const { setGlobalError } = useErrorStore();
  const { isoCategories } = useIsoCategories();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [isoCategory, setIsoCategory] = useState<string>("");
  const [fieldError, setFieldError] = useState<Error | undefined>(undefined);
  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { suppliers } = useSuppliers();
  const [supplier, setSupplier] = useState<string>("");
  const [supplierUUID, setSupplierUUID] = useState<string>("");
  const [selectedSupplierOptions, setSelectedSupplierOptions] = useState<string[]>([]);

  const { loggedInUser } = useAuthStore();

  const validateFields = () => {
    const titleError = !title || title === "";
    const isoError = !isoCategory || isoCategory === "";
    const supplierError = !supplier || supplier === "";
    setFieldError({
      titleErrorMessage: titleError ? "Du må skrive en tittel" : undefined,
      isoCodeErrorMessage: isoError ? "Du må velge en iso-kategori" : undefined,
      supplierErrorMessage: supplierError ? "Du må velge en leverandør" : undefined,
    });
    console.log(supplierError);

    return !(titleError || isoError);
  };

  async function onSubmit() {
    if (validateFields()) {
      const newSeries: SeriesDraftWithDTO = {
        title: title,
        isoCategory: handleSetFormValueIso(isoCategory),
      };

      if (loggedInUser && loggedInUser.isAdmin) {
        const supplierUUID = suppliers?.find((sup) => sup.name === supplier)?.id;

        draftNewSeriesForAdmin(newSeries, supplierUUID!)
          .then((newSeries) => {
            navigate(`/produkter/${newSeries.id}`);
          })
          .catch((error) => {
            setGlobalError(error);
          });
      } else {
        draftNewSeries(newSeries)
          .then((newSeries) => {
            navigate(`/produkter/${newSeries.id}`);
          })
          .catch((error) => {
            setGlobalError(error);
          });
      }
    }
  }

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    return parts[parts.length - 1].replace(/\s/g, ""); // Remove spaces
  };

  const onToggleSelected = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setIsoCategory(option);
      setSelectedOptions([option]);
    } else {
      setIsoCategory("");
      setSelectedOptions([]);
    }
  };

  const onToggleSelectedSupplier = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setSupplier(option);
      setSelectedSupplierOptions([option]);
      console.log("option", option);
      console.log("selectedSupplier", supplier);
    } else {
      setSupplier("");
      setSelectedSupplierOptions([]);
    }
  };

  return (
    <FormBox title="Kom i gang med nytt produkt" icon={<PackageIcon />}>
      <VStack gap="7">
        <TextField
          label={labelRequired("Produktnavn")}
          id="productName"
          name="productName"
          type="text"
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => setFieldError({ ...fieldError, titleErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, titleErrorMessage: undefined })}
          error={fieldError?.titleErrorMessage ?? ""}
        />
        <IsoComboboxProvider
          label={labelRequired("Iso-kategori (kode)")}
          description={"Søk etter isokategori produktet passer best inn i"}
          selectedOptions={selectedOptions}
          options={isoCodesAndTitles || []}
          onToggleSelected={onToggleSelected}
          onBlur={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
          error={fieldError?.isoCodeErrorMessage ?? ""}
          maxSelected={{ limit: 1 }}
        />
        {loggedInUser && loggedInUser.isAdmin && suppliers && (
          <Box asChild style={{ maxWidth: "475px" }}>
            <UNSAFE_Combobox
              clearButton
              clearButtonLabel="Tøm"
              label="Leverandør"
              // selectedOptions={searchParams
              //   .getAll("supplier")
              //   .map((uuid) => suppliers.find((supplier) => supplier.id === uuid)?.name || "")}
              onToggleSelected={onToggleSelectedSupplier}
              onBlur={() => setFieldError({ ...fieldError, supplierErrorMessage: undefined })}
              onFocus={() => setFieldError({ ...fieldError, supplierErrorMessage: undefined })}
              options={suppliers?.map((supplier) => supplier.name) || []}
              error={fieldError?.supplierErrorMessage ?? ""}
            />
          </Box>
        )}

        <HStack gap="4">
          <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
            Avbryt
          </Button>
          <Button type="submit" size="medium" onClick={onSubmit}>
            Opprett
          </Button>
        </HStack>
      </VStack>
    </FormBox>
  );
}
