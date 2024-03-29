import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, TextField } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "./create-product.scss";
import React from "react";
import { createNewProductSchema } from "utils/zodSchema/newProduct";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { useIsoCategories } from "utils/swr-hooks";
import { useNavigate } from "react-router-dom";
import { ProductDraftWithDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { HM_REGISTER_URL } from "environments";
import { useAuthStore } from "utils/store/useAuthStore";
import Combobox from "felleskomponenter/Combobox";

type FormData = z.infer<typeof createNewProductSchema>;

export default function OpprettProdukt() {
  const { setGlobalError } = useHydratedErrorStore();
  const { isoCategories, isoError } = useIsoCategories();
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createNewProductSchema),
    mode: "onSubmit",
  });
  const { loggedInUser } = useAuthStore();

  const createProductDraftPath = () =>
    loggedInUser?.isAdmin
      ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/draftWith`
      : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/draftWith`;

  async function onSubmit(data: FormData) {
    const newProduct: ProductDraftWithDTO = {
      title: data.productName,
      text: "",
      isoCategory: data.isoCategory,
    };

    const response = await fetch(createProductDraftPath(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newProduct),
    });
    if (response.ok) {
      const responseData = await response.json();
      const id = responseData.id;
      if (id) navigate(`/produkter/${id}`);
    } else {
      const responsData = await response.json();
      setGlobalError(response.status, responsData.message);
    }
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
              errorMessage={errors?.productName?.message}
            />
            <div className="button-container">
              <Button type="reset" variant="tertiary" size="medium" onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type="submit" size="medium">
                Opprett
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
