import React, { useState } from "react";
import "./opprett-admin-user.scss";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PersonIcon } from "@navikt/aksel-icons";
import { Alert, Button, Checkbox, HStack, Heading, TextField, VStack } from "@navikt/ds-react";
import { newAdminUserSchema } from "utils/zodSchema/newUser";
import { useErrorStore } from "utils/store/useErrorStore";
import { useNavigate } from "react-router-dom";
import { NewAdminUserDTO } from "utils/admin-util";
import { labelRequired } from "utils/string-util";
import { HM_REGISTER_URL } from "environments";
import FormBox from "felleskomponenter/FormBox";

type FormData = z.infer<typeof newAdminUserSchema>;

export default function CreateAdminUser() {
  const { setGlobalError } = useErrorStore();

  const navigate = useNavigate();
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(newAdminUserSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    const newAdminUser: NewAdminUserDTO = {
      name: "",
      email: data.email || "",
      password: data.password || "",
      roles: ["ROLE_ADMIN"],
      attributes: {},
    };
    const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newAdminUser),
    });
    if (response.ok) {
      const responseData = await response.json();
      navigate("/admin/profil");
    } else {
      //Mulig 400 bør håndteres direkte her siden 400 i denne konteksten betyr skjemafeil og bør kanskje skrives rett under firmanavnfeltet.
      //Samtidig så bør ikke 400 skje med riktig validering men vi får 400 feil når man registrerer to
      //leverandører med samme navn.
      const responsData = await response.json();
      setGlobalError(response.status, responsData.message);
    }
  }

  return (

    <FormBox title="Opprett ny admin-bruker" icon={<PersonIcon />}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="7" width="300px">
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
          <TextField
            {...register("password", { required: true })}
            label={labelRequired("Midlertidig passord")}
            id="password"
            type={isPasswordShown ? "text" : "password"}
            description="Passordet skal byttes ved første innlogging"
            name="password"
            autoComplete="off"
            error={errors?.password?.message}
          />
          <Checkbox onClick={() => setIsPasswordShown((prevState) => !prevState)} value="isPassShown">
            Vis passord
          </Checkbox>
          <Alert variant="info">
            OBS! Det vil ikke være mulig å finne tilbake til det midlertidige passordet etter at brukeren er
            opprettet.
          </Alert>
          <HStack gap="4">
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
