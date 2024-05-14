import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, TextField } from "@navikt/ds-react";
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

type FormData = z.infer<typeof createNewSeriesSchema>;

export default function OpprettProdukt() {
  const { setGlobalError } = useErrorStore();
  const { isoCategories, isoError } = useIsoCategories();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
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
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoCode + " - " + cat.isoTitle);

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    const firstPartWithoutSpaces = parts[0].replace(/\s/g, ""); // Remove spaces
    setValue("isoCategory", firstPartWithoutSpaces);
  };

  return (
    <main>
      <div className="create-new-product">
        <div className="content">
          <Heading level="1" size="large" align="center">
            Kom i gang med nytt produkt
          </Heading>
          <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
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
            <div className="button-container">
              <Button type="reset" variant="tertiary" size="medium" onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type="submit" size="medium" disabled={isSubmitting}>
                Opprett
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
