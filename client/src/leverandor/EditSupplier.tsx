import React, { useEffect } from "react";
import { Button, Heading, Loader, TextField } from "@navikt/ds-react";
import { Buldings3Icon } from "@navikt/aksel-icons";
import "./create-supplier.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { newSupplierSchema } from "utils/zodSchema/newSupplier";
import { useNavigate, useParams } from "react-router-dom";
import { labelRequired } from "utils/string-util";
import { useSupplier } from "utils/swr-hooks";
import { SupplierDTOBody } from "utils/supplier-util";
import { updateSupplier } from "api/SupplierApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { useAuthStore } from "utils/store/useAuthStore";

type FormData = z.infer<typeof newSupplierSchema>;
export default function EditSupplier() {
  const { supplierId } = useParams();

  const { supplier, supplierError, supplierIsLoading, supplierMutate } = useSupplier(true, supplierId);

  const navigate = useNavigate();

  const { setGlobalError } = useErrorStore();
  const { loggedInUser } = useAuthStore();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(newSupplierSchema),
    mode: "onChange",
    defaultValues: {
      name: supplier?.name || "",
      email: supplier?.supplierData.email || "",
      homepage: supplier?.supplierData.homepage || "",
      phone: supplier?.supplierData.phone || "",
    },
  });

  useEffect(() => {
    reset({
      name: supplier?.name || "",
      email: supplier?.supplierData.email || "",
      homepage: supplier?.supplierData.homepage || "",
      phone: supplier?.supplierData.phone || "",
    });
  }, [supplier]);

  if (supplierIsLoading) {
    return <Loader size="3xlarge" title="venter..."></Loader>;
  }

  if (supplierError) {
    setGlobalError(supplierError);
  }

  async function onSubmit(data: FormData) {
    const cleanedPhoneNumber = data.phone.replace(/[^+\d]+/g, "");

    const editedSupplier: SupplierDTOBody = {
      name: data.name,
      supplierData: {
        email: data.email,
        homepage: data.homepage,
        phone: cleanedPhoneNumber,
      },
    };

    updateSupplier(loggedInUser?.isAdmin || false, supplierId!, editedSupplier)
      .then(() => {
        supplierMutate();
        navigate(`/leverandor/${supplierId}`);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <div className="create-new-supplier">
      <div className="content">
        <div className="header-container">
          <Buldings3Icon title="a11y-title" width={43} height={43} aria-hidden />
          <Heading level="1" size="large" align="center">
            Endre leverandørinformasjon
          </Heading>
        </div>
        <form action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("name", { required: true })}
            label={labelRequired("Firmanavn")}
            id="name"
            name="name"
            type="text"
            autoComplete="on"
            error={errors.name && errors.name.message}
          />
          <TextField
            {...register("email", { required: false })}
            label={"E-post"}
            id="email"
            type="email"
            name="email"
            autoComplete="on"
            error={errors.email && errors.email.message}
          />
          <TextField
            {...register("homepage", { required: false })}
            label="Nettside"
            id="homepage"
            type="text"
            name="homepage"
            description="Eksempel: www.domene.no"
            autoComplete="on"
            error={errors.homepage && errors.homepage.message}
          />
          <TextField
            {...register("phone", { required: false })}
            label="Telefonnummer"
            id="phoneNumber"
            type="text"
            name="phone"
            autoComplete="on"
            error={errors.phone && errors.phone.message}
          />
          <div className="button-container">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium" disabled={!isValid || isSubmitting}>
              Lagre
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
