import { Button, HStack, TextField, VStack } from "@navikt/ds-react";
import "./create-product.scss";
import { useErrorStore } from "utils/store/useErrorStore";
import { useIsoCategories } from "utils/swr-hooks";
import { useNavigate } from "react-router-dom";
import { SeriesDraftWithDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { draftNewSeries } from "api/SeriesApi";
import FormBox from "felleskomponenter/FormBox";
import { PackageIcon } from "@navikt/aksel-icons";
import { useState } from "react";
import { ISO_Combobox } from "products/iso-combobox";

type Error = {
  titleField?: boolean | undefined;
  isoField?: boolean | undefined;
  message: string | undefined;
};

export default function CreateProduct() {
  const { setGlobalError } = useErrorStore();
  const { isoCategories } = useIsoCategories();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [isoCategory, setIsoCategory] = useState<string>("");
  const [error, setError] = useState<Error | undefined>(undefined);
  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const validateFields = () => {
    setError(undefined);
    if (!title || title === "") {
      setError({ titleField: true, message: "Du må skrive en tittel" });
      return false;
    }
    if (!isoCategory || isoCategory === "") {
      setError({ isoField: true, message: "Du må velge en iso-kategori" });
      return false;
    }
    return true;
  };

  async function onSubmit() {
    if (validateFields()) {
      const newSeries: SeriesDraftWithDTO = {
        title: title,
        isoCategory: handleSetFormValueIso(isoCategory),
      };

      draftNewSeries(newSeries)
        .then((newSeries) => {
          navigate(`/produkter/${newSeries.id}`);
        })
        .catch((error) => {
          setGlobalError(error);
        });
    }
  }

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    return parts[1].replace(/\s/g, ""); // Remove spaces
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

  return (
    <FormBox title="Kom i gang med nytt produkt" icon={<PackageIcon />}>
      <VStack gap="7">
        <TextField
          label={labelRequired("Produktnavn")}
          id="productName"
          name="productName"
          type="text"
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => setError(undefined)}
          onFocus={() => setError(undefined)}
          error={error?.titleField ? error.message : ""}
        />
        <ISO_Combobox
          label={labelRequired("Iso-kategori (kode)")}
          description={"Søk etter isokategori produktet passer best inn i"}
          selectedOptions={selectedOptions}
          options={isoCodesAndTitles || []}
          onToggleSelected={onToggleSelected}
          error={error?.isoField ? error.message : ""}
          maxSelected={{ limit: 1 }}
        />
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
