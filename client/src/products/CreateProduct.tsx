import { zodResolver } from "@hookform/resolvers/zod";
import { Button, HStack, Heading, TextField, VStack } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "./create-product.scss";
import { useErrorStore } from "utils/store/useErrorStore";
import { useIsoCategories } from "utils/swr-hooks";
import { useNavigate } from "react-router-dom";
import { SeriesDraftWithDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import Combobox from "felleskomponenter/Combobox";
import { createNewSeriesSchema } from "utils/zodSchema/newSeries";
import { draftNewSeries } from "api/SeriesApi";
import FormBox from "felleskomponenter/FormBox";
import { PackageIcon } from "@navikt/aksel-icons";

type FormData = z.infer<typeof createNewSeriesSchema>;

export default function CreateProduct() {
  const { setGlobalError } = useErrorStore();
  const { isoCategories, isoError } = useIsoCategories();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createNewSeriesSchema),
    mode: "onSubmit",
  });

  async function onSubmit(data: FormData) {
    const newSeries: SeriesDraftWithDTO = {
      title: data.productName,
      isoCategory: data.isoCategory,
    };

    draftNewSeries(newSeries)
      .then((newSeries) => {
        navigate(`/produkter/${newSeries.id}`);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    const lastPartWithoutSpaces = parts[1].replace(/\s/g, ""); // Remove spaces
    setValue("isoCategory", lastPartWithoutSpaces);
  };

  return (
    <FormBox title="Kom i gang med nytt produkt" icon={<PackageIcon />}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="7">
          <TextField
            {...register("productName", { required: true })}
            label={labelRequired("Produktnavn")}
            id="productName"
            name="productName"
            type="text"
            error={errors?.productName?.message}
          />
          <Combobox
            {...register("isoCategory", { required: true })}
            options={isoCodesAndTitles}
            setValue={handleSetFormValueIso}
            label={labelRequired("Iso-kategori (kode)")}
            errorMessage={errors?.isoCategory && "Du må velge en isokategori"}
          />
          <HStack gap="4">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium" disabled={isSubmitting}>
              Opprett
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  );
}
