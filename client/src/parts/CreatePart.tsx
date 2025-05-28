import { Box, Button, HStack, Radio, RadioGroup, TextField, UNSAFE_Combobox, VStack } from "@navikt/ds-react";
import { useErrorStore } from "utils/store/useErrorStore";
import { useIsoCategories, useSuppliers } from "utils/swr-hooks";
import { useNavigate } from "react-router-dom";
import { PartDraftWithDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import FormBox from "felleskomponenter/FormBox";
import { PackageIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import IsoComboboxProvider from "products/iso-combobox/IsoComboboxProvider";
import { useAuthStore } from "utils/store/useAuthStore";
import { draftAndPublishNewPart } from "api/PartApi";

type Error = {
  titleErrorMessage?: string | undefined;
  isoCodeErrorMessage?: string | undefined;
  supplierErrorMessage?: string | undefined;
  hmsNrErrorMessage?: string | undefined;
  levArtNrErrorMessage?: string | undefined;
};

export default function CreatePart() {
  const { setGlobalError } = useErrorStore();
  const { isoCategories } = useIsoCategories();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [levArtNr, setLevArtNr] = useState<string>("");
  const [hmsArtNr, setHmsArtNr] = useState<string>("");
  const [isoCategory, setIsoCategory] = useState<string>("");
  const [partType, setPartType] = useState<string>("sparePart");
  const [fieldError, setFieldError] = useState<Error | undefined>(undefined);
  const uniqueIsoCodes = isoCategories?.filter(
    (cat) => cat.isoCode && cat.isoCode.length === 6 && /9[0-6]$/.test(cat.isoCode),
  );
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [supplier, setSupplier] = useState<string>("");

  const { loggedInUser } = useAuthStore();

  const { suppliers } = useSuppliers(loggedInUser?.isAdminOrHmsUser || false);

  const validateFields = () => {
    const titleError = !title || title === "";
    const isoError = !isoCategory || isoCategory === "";
    const supplierError = !supplier || supplier === "";
    const hmsNrError = !hmsArtNr || hmsArtNr === "";
    setFieldError({
      titleErrorMessage: titleError ? "Du må skrive en tittel" : undefined,
      isoCodeErrorMessage: isoError ? "Du må velge en iso-kategori" : undefined,
      supplierErrorMessage: supplierError ? "Du må velge en leverandør" : undefined,
      hmsNrErrorMessage: hmsNrError ? "Du må skrive inn HMS-nr" : undefined,
      levArtNrErrorMessage: !levArtNr || levArtNr === "" ? "Du må skrive inn Lev-artnr" : undefined,
    });

    return !(titleError || isoError);
  };

  async function onSubmit() {
    if (validateFields()) {
      if (loggedInUser) {
        let supplierUUID: string | undefined;

        if (loggedInUser.isAdmin || loggedInUser.isHmsUser) {
          supplierUUID = suppliers?.find((sup) => sup.name === supplier)?.id;
        } else if (loggedInUser.isSupplier) {
          supplierUUID = loggedInUser.supplierId;
        }

        if (supplierUUID) {
          const newPart: PartDraftWithDTO = {
            title: title,
            isoCategory: handleSetFormValueIso(isoCategory),
            accessory: partType === "accessory",
            sparePart: partType === "sparePart",
            supplierId: supplierUUID,
            levArtNr: levArtNr,
            hmsArtNr: hmsArtNr,
          };

          draftAndPublishNewPart(newPart, supplierUUID)
            .then((newPart) => {
              navigate(`/del/${newPart.id}`);
            })
            .catch((error) => {
              setGlobalError(error);
            });
        } else {
          setFieldError({
            ...fieldError,
            supplierErrorMessage: "Leverandør-ID kunne ikke bestemmes",
          });
        }
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
    } else {
      setSupplier("");
    }
  };

  return (
    <FormBox title="Opprett ny del" icon={<PackageIcon />}>
      <VStack gap="7">
        <RadioGroup legend="" onChange={setPartType} value={partType}>
          <Radio value="sparePart">Reservedel</Radio>
          <Radio value="accessory">Tilbehør</Radio>
        </RadioGroup>
        <TextField
          label={labelRequired("Delens navn")}
          id="productName"
          name="productName"
          type="text"
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => setFieldError({ ...fieldError, titleErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, titleErrorMessage: undefined })}
          error={fieldError?.titleErrorMessage ?? ""}
        />
        <TextField
          label={labelRequired("Hms-nr")}
          id="hmsNr"
          name="hmsNr"
          type="text"
          onChange={(event) => setHmsArtNr(event.target.value)}
          onBlur={() => setFieldError({ ...fieldError, hmsNrErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, hmsNrErrorMessage: undefined })}
          error={fieldError?.hmsNrErrorMessage ?? ""}
        />
        <TextField
          label={labelRequired("Lev-artnr")}
          id="levArtNr"
          name="levArtNr"
          type="text"
          onChange={(event) => setLevArtNr(event.target.value)}
          onBlur={() => setFieldError({ ...fieldError, levArtNrErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, levArtNrErrorMessage: undefined })}
          error={fieldError?.levArtNrErrorMessage ?? ""}
        />
        <IsoComboboxProvider
          label={labelRequired("Iso-kategori (kode)")}
          description={"Søk etter isokategori delen passer best inn i"}
          selectedOptions={selectedOptions}
          options={isoCodesAndTitles || []}
          onToggleSelected={onToggleSelected}
          onBlur={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
          onFocus={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
          error={fieldError?.isoCodeErrorMessage ?? ""}
          maxSelected={{ limit: 1 }}
        />
        {loggedInUser && loggedInUser.isAdminOrHmsUser && suppliers && (
          <Box asChild style={{ maxWidth: "475px" }}>
            <UNSAFE_Combobox
              clearButton
              clearButtonLabel="Tøm"
              label={labelRequired("Leverandør")}
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
