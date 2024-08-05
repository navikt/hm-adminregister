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
import { mapLoggedInUser } from "utils/user-util";
import { adminInfoUpdate } from "utils/zodSchema/login";
import { z } from "zod";

type FormData = z.infer<typeof adminInfoUpdate>;

interface BlurredFields {
  name: boolean;
  phone: boolean;
}

const EditAdminUser = () => {
  const { loggedInUser } = useAuthStore();
  const { user, userIsLoading } = useUser(loggedInUser);

  if (userIsLoading) {
    return <Loader size="3xlarge" title="venter..."></Loader>;
  }

  return (
    <main>
      <div className="auth-page">
        {user && loggedInUser?.isAdmin && (
          <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
            <PersonPencilIcon fontSize="1.5rem" aria-hidden />
            <Heading spacing level="2" size="small" align="center">
              Oppdater informasjonen om deg
            </Heading>
            {user && <AdminUserEditForm user={user} />}
          </div>
        )}
      </div>
    </main>
  );
};

export default EditAdminUser;

const AdminUserEditForm = ({ user }: { user: UserDTO }) => {
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
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(adminInfoUpdate),
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
    try {
      setLoading(true);
      const response = await fetch(`${HM_REGISTER_URL()}/admreg/admin/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: userInfoBody,
      });
      if (response.ok) {
        const loggedInUser = mapLoggedInUser(await response.json());
        navigate("/admin/profil");
      }

      if (!response.ok) {
        setGlobalError(response.status, response.statusText);
      }
      setLoading(false);
    } catch (e: any) {
      setError(e);
      setLoading(false);
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
        autoComplete="on"
        description="Fornavn og etternavn"
        onBlur={() => handleFieldBlur("name")}
        onFocus={() => handleFieldFocus("name")}
        error={blurredFields.name && errors?.name?.message}
      />
      <TextField
        {...register("phone", { required: false })}
        label="Telefonnummer"
        autoComplete="on"
        type="text"
        name="phone"
        onBlur={() => handleFieldBlur("phone")}
        onFocus={() => handleFieldFocus("phone")}
        error={blurredFields.phone && errors?.phone?.message}
      />
      <div className="auth-dialog-box__button-container">
        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
          Avbryt
        </Button>
        <Button type="submit" size="medium" disabled={!isDirty || !isValid || isSubmitting}>
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
