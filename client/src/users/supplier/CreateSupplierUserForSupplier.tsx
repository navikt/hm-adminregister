import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PersonIcon } from "@navikt/aksel-icons";
import { Alert, Button, Checkbox, HStack, TextField, VStack } from "@navikt/ds-react";
import { newSupplierUserSchema } from "utils/zodSchema/newUser";
import { useErrorStore } from "utils/store/useErrorStore";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SupplierUserDTO } from "utils/supplier-util";
import { labelRequired } from "utils/string-util";
import { HM_REGISTER_URL } from "environments";
import FormBox from "felleskomponenter/FormBox";

type FormData = z.infer<typeof newSupplierUserSchema>;

export default function CreateSupplierUserForSupplier() {
  const { setGlobalError } = useErrorStore();
  const location = useLocation();
  const supplierName = location.state as string;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(newSupplierUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  async function onSubmit(data: FormData) {
    const newSupplierUser: SupplierUserDTO = {
      name: "",
      email: data.email || "",
      password: data.password || "",
      roles: ["ROLE_SUPPLIER"],
      attributes: {
        // supplierId: '85853609-37ef-4fea-be03-67ccc9613ee4',
        supplierId: searchParams.get("suppid") || "",
      },
    };
    const response = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newSupplierUser),
    });
    if (response.ok) {
      const responseData = await response.json();
      const id = responseData.attributes.supplierId;
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
    <FormBox
      title="Opprett ny bruker"
      icon={<PersonIcon aria-hidden={true} title="a11y-title" width={43} height={43} />}
    >
      <form action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="space-8" width="300px">
          <VStack>
            <strong>Leverandør</strong>
            {supplierName}
          </VStack>
          <TextField
            {...register("email", { required: true })}
            label={labelRequired("E-post")}
            id="email"
            type="email"
            name="email"
            description="Eksempel: firma@domene.no"
            autoComplete="off"
            error={errors?.email?.message}
          />
          <VStack>
            <TextField
              {...register("password", { required: true })}
              label={labelRequired("Midlertidig passord")}
              id="password"
              type={isPasswordShown ? "text" : "password"}
              name="password"
              description="Passordet skal byttes ved første innlogging"
              autoComplete="off"
              error={errors?.password?.message}
            />
            <Checkbox onClick={() => setIsPasswordShown((prevState) => !prevState)} value="isPassShown">
              Vis passord
            </Checkbox>
          </VStack>
          <Alert variant="info">
            OBS! Det ikke vil være mulig å finne tilbake til det midlertidige passordet etter at brukeren er opprettet.
          </Alert>
          <HStack gap="space-4">
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
