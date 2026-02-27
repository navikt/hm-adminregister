import React, { useState } from "react";
import { Button, HStack, TextField, VStack } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { newSupplierSchema } from "utils/zodSchema/newSupplier";
import { useErrorStore } from "utils/store/useErrorStore";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumber, labelRequired } from "utils/string-util";
import { SupplierDTOBody } from "utils/supplier-util";
import { HM_REGISTER_URL } from "environments";
import FormBox from "felleskomponenter/FormBox";
import { Buildings3Icon } from "@navikt/aksel-icons";

type FormData = z.infer<typeof newSupplierSchema>;

export default function CreateSupplier() {
  const { setGlobalError } = useErrorStore();

  const [phoneValue, setPhoneValue] = useState("");

  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(newSupplierSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(data: FormData) {
    console.log("in onsubmit");
    //remove all white spaces
    const cleanedPhoneNumber = phoneValue.replace(/\s+/g, "");

    const newSupplier: SupplierDTOBody = {
      name: data.name,
      supplierData: {
        email: data.email || "",
        phone: cleanedPhoneNumber || "",
        homepage: data.homepage || "",
      },
    };

    const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newSupplier),
    });
    if (response.ok) {
      const responseData = await response.json();
      const id = responseData.id;
      if (id) navigate(`/leverandor/${id}`);
    } else {
      //Mulig 400 bør håndteres direkte her siden 400 i denne konteksten betyr skjemafeil og bør kanskje skrives rett under firmanavnfeltet.
      //Samtidig så bør ikke 400 skje med riktig validering men vi får 400 feil når man registrerer to
      //leverandører med samme navn.
      const responsData = await response.json();
      setGlobalError(response.status, responsData.message);
    }
  }

  return (
    <FormBox title="Opprett ny leverandør" icon={<Buildings3Icon />}>
      <form method="POST" onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="space-8" width="300px">
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
            description="Eksempel: e-post til kundeservice"
            autoComplete="on"
            error={errors.email && errors.email.message}
          />
          <TextField
            {...register("homepage", { required: false })}
            label="Nettside"
            id="homepage"
            type="text"
            name="homepage"
            description="Eksempel: https://www.domene.no"
            autoComplete="on"
            error={errors.homepage && errors.homepage.message}
          />
          <TextField
            {...register("phone", { required: false })}
            label="Telefonnummer"
            id="phoneNumber"
            type="text"
            name="phone"
            description="Eksempel: nummer til kundeservice"
            autoComplete="on"
            onChange={(event) => setPhoneValue(event.target.value)}
            onBlur={() => setPhoneValue(formatPhoneNumber(phoneValue))}
            error={errors.phone && errors.phone.message}
            value={phoneValue}
          />

          <HStack gap="space-4" align="center">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium">
              Opprett
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  );
}
