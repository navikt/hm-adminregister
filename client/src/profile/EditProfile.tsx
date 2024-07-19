import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { PersonPencilIcon } from "@navikt/aksel-icons";
import { Button, Heading, Loader, TextField } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { formatPhoneNumber, labelRequired } from "utils/string-util";
import { useUser } from "utils/swr-hooks";
import { UserDTO } from "utils/types/response-types";
import { supplierUserInfoUpdate } from "utils/zodSchema/login";

type FormData = z.infer<typeof supplierUserInfoUpdate>;

interface BlurredFields {
  name: boolean;
  phone: boolean;
}

const EditProfile = () => {
  const { loggedInUser } = useAuthStore();
  const { user, userIsLoading } = useUser(loggedInUser);

  if (userIsLoading) {
    return <Loader size="3xlarge" title="venter..."></Loader>;
  }

  return (
    <main>
      <div className="auth-page">
        <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
          <PersonPencilIcon title="a11y-title" fontSize="1.5rem" />
          <Heading spacing level="2" size="small" align="center">
            Oppdater informasjonen om deg
          </Heading>
          {user && <SupplierUserProfile user={user} />}
        </div>
      </div>
    </main>
  );
};
export default EditProfile;

const SupplierUserProfile = ({ user }: { user: UserDTO }) => {
  const { setGlobalError } = useErrorStore();
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    name: false,
    phone: false,
  });
  const [phoneValue, setPhoneValue] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(supplierUserInfoUpdate),
    mode: "onChange",
    defaultValues: {
      name: user.name || "",
      phone: user.attributes.phone || "",
    },
  });
  const handleFieldBlur = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: true,
    });

    if (fieldName === "phone") {
      const formattedValue = formatPhoneNumber(phoneValue);
      setPhoneValue(formattedValue);
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: false,
    });
  };

  async function onSubmit(data: FormData) {
    const cleanedPhoneNumber = data.phone.replace(/[^+\d]+/g, "");

    const userInfoBody = JSON.stringify({
      ...user,
      name: data.name,
      attributes: {
        ...user?.attributes,
        phone: cleanedPhoneNumber || "",
      },
    });
    setLoading(true);
    const response = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: userInfoBody,
    });
    if (response.ok) {
      navigate("/profil");
      setLoading(false);
    } else {
      //Mulig 400 bør håndteres direkte her siden 400 i denne konteksten betyr skjemafeil og bør kanskje skrives rett under firmanavnfeltet.
      //Samtidig så bør ikke 400 skje med riktig validering men vi får 400 feil når man registrerer to
      //leverandører med samme navn.
      const responsData = await response.json();
      setGlobalError(response.status, responsData.message);
    }
  }

  if (isLoading) {
    return <Loader size="3xlarge" title="Sender..."></Loader>;
  }

  return (
    <form className="auth-dialog-box__form" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register("name", { required: true })}
        label={labelRequired("Navn")}
        id="name"
        name="name"
        size="medium"
        autoComplete="on"
        description="Fornavn og etternavn"
        onBlur={() => handleFieldBlur("name")}
        onFocus={() => handleFieldFocus("name")}
        error={blurredFields.name && errors?.name?.message}
      />
      <TextField
        {...register("phone", { required: false })}
        label="Telefonnummer"
        id="phoneNumber"
        type="text"
        name="phone"
        autoComplete="on"
        onBlur={() => handleFieldBlur("phone")}
        onFocus={() => handleFieldFocus("phone")}
        error={blurredFields.phone && errors?.phone?.message}
      />
      <div className="auth-dialog-box__button-container">
        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
          Avbryt
        </Button>
        <Button type="submit" size="medium" disabled={isSubmitting}>
          Lagre
        </Button>
      </div>
      {error?.name && (
        <p>
          <span className="auth-dialog-box__error-message">{error?.message}</span>
        </p>
      )}
    </form>
  );
};
