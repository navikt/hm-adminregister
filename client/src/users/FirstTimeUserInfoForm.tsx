import { zodResolver } from "@hookform/resolvers/zod";
import { PersonPencilIcon } from "@navikt/aksel-icons";
import { Button, Heading, Loader, TextField } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumber, labelRequired } from "utils/string-util";
import { UserDTO } from "utils/types/response-types";
import { userInfoUpdate } from "utils/zodSchema/login";
import { z } from "zod";

type FormData = z.infer<typeof userInfoUpdate>;

const FirstTimeUserInfoForm = ({
  user,
  isAdmin,
  isHmsUser,
}: {
  user: UserDTO;
  isAdmin: boolean;
  isHmsUser: boolean;
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(userInfoUpdate),
    mode: "onBlur",
    defaultValues: {},
  });

  const handleFieldBlur = (fieldName: string, value: string) => {
    if (fieldName === "phone") {
      const formattedValue = formatPhoneNumber(value);
      setValue("phone", formattedValue, { shouldValidate: true, shouldDirty: true });
    }
  };

  const userPasswordUrl = isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/users/password`
    : isHmsUser
      ? `${HM_REGISTER_URL()}/admreg/hms-user/api/v1/users/password`
      : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/users/password`;

  const userInfoUrl = isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/users/${user.id}`
    : isHmsUser
      ? `${HM_REGISTER_URL()}/admreg/hms-user/api/v1/users/${user.id}`
      : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/users`;

  async function onSubmit(data: FormData) {
    const cleanedPhoneNumber = data.phone.replace(/[^+\d]+/g, "");
    const passwordBody = JSON.stringify({
      oldPassword: data.oldPassword,
      newPassword: data.confirmPassword,
    });
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
      const passwordResponse = await fetch(userPasswordUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: passwordBody,
      });

      if (!passwordResponse.ok) {
        throw Error("Feil passord");
      }

      const userInfoResponse = await fetch(userInfoUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: userInfoBody,
      });

      if (passwordResponse.ok && userInfoResponse.ok) {
        if (isAdmin) {
          navigate("/admin/profil");
        } else if (isHmsUser) {
          navigate("/");
        } else {
          navigate("/logg-inn/leverandoropplysninger");
        }
      }

      if (!passwordResponse.ok || !userInfoResponse.ok) {
        throw Error("Error from post");
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
    <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
      <PersonPencilIcon fontSize="1.5rem" aria-hidden />
      <Heading spacing level="2" size="small" align="center">
        Fyll ut informasjonen om deg og lag et nytt passord.
      </Heading>
      <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("name", { required: true })}
          label={labelRequired("Navn")}
          aria-required
          name="name"
          autoComplete="on"
          description="Fornavn og etternavn"
          error={errors?.name && errors?.name?.message}
        />
        <TextField
          {...register("phone", { required: false })}
          label="Telefonnummer"
          autoComplete="on"
          type="text"
          name="phone"
          onBlur={(event) => handleFieldBlur("phone", event.target.value)}
          error={errors?.phone && errors?.phone?.message}
        />

        <TextField
          {...register("oldPassword", { required: true })}
          aria-required
          label={labelRequired("Gammelt passord")}
          type="password"
          name="oldPassword"
          placeholder="********"
          autoComplete="off"
          error={errors?.oldPassword && errors?.oldPassword?.message}
        />
        <TextField
          {...register("newPassword", { required: true })}
          aria-required
          label={labelRequired("Lag ett passord")}
          description="Minst 8 karakterer langt"
          type="password"
          name="newPassword"
          placeholder="********"
          autoComplete="off"
          error={errors?.newPassword && errors?.newPassword?.message}
        />
        <TextField
          {...register("confirmPassword", { required: true })}
          aria-required
          label={labelRequired("Gjenta passord")}
          type="password"
          name="confirmPassword"
          placeholder="********"
          autoComplete="off"
          error={errors?.confirmPassword && errors?.confirmPassword?.message}
        />
        {error?.message && <span className="auth-dialog-box__error-message">{error?.message}</span>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="small" /> : "Lagre"}
        </Button>
      </form>
    </div>
  );
};

export default FirstTimeUserInfoForm;
