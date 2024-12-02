import { zodResolver } from "@hookform/resolvers/zod";
import { ComponentIcon } from "@navikt/aksel-icons";
import { Button, Heading, Loader, TextField, VStack } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { mapLoggedInUser } from "utils/user-util";
import { loginSchema } from "utils/zodSchema/login";
import { z } from "zod";
import { baseUrl } from "utils/swr-hooks";
import { logAmplitudeEvent } from "utils/amplitude";

type FormData = z.infer<typeof loginSchema>;

interface BlurredFields {
  email: boolean;
  password: boolean;
}

export default function Login() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    email: false,
    password: false,
  });
  const { setLoggedInUser } = useAuthStore();
  const { state } = useLocation();
  const previousLocation = typeof state === "string" ? state : "/produkter";

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const navigate = useNavigate();

  const handleFieldBlur = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: true,
    });
  };
  const handleFieldFocus = (fieldName: string) => {
    setBlurredFields({
      ...blurredFields,
      [fieldName]: false,
    });
  };

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);
      const loginRes = await fetch(`${HM_REGISTER_URL()}/admreg/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (loginRes.ok) {
        const loggedInUserRes = await fetch(`${HM_REGISTER_URL()}/admreg/loggedInUser`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (loggedInUserRes.ok) {
          const loggedInUser = mapLoggedInUser(await loggedInUserRes.json());
          setLoggedInUser(loggedInUser);
          logAmplitudeEvent("login", "alle innlogginger med suksess");

          if (loggedInUser.userName === "") {
            if (loggedInUser.isAdmin) {
              logAmplitudeEvent("login, ny bruker", "admin");
              navigate("/admin/adminopplysninger");
            } else {
              logAmplitudeEvent("login, ny bruker", "supplier");
              navigate("/logg-inn/brukeropplysninger");
            }
          } else {
            if (loggedInUser.isAdmin) {
              logAmplitudeEvent("login", "admin");
              navigate(previousLocation);
            } else {
              logAmplitudeEvent("login", "hverken ny bruker, admin eller supplier?");
              navigate(previousLocation);
            }
          }
        } else {
          logAmplitudeEvent("login", "innlogging bruker feil");
          throw new Error("Logged in user not ok");
        }
      } else {
        logAmplitudeEvent("login", "innlogging feil - brukernavn eller passord");
        throw new Error("Feil brukernavn eller passord");
      }
    } catch (e: any) {
      setError(e);
      setLoading(false);
    }
  }

  if (isLoading) return <Loader size="3xlarge" title="Logger inn" />;

  return (
    <div className="auth-page">
      <span className="logo-and-name-container">
        <ComponentIcon aria-hidden fontSize="3rem" />
        <Heading level="1" size="small" className="name">
          <span>FinnHjelpemiddel</span>
          <span>Admin</span>
        </Heading>
      </span>
      <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
        <Heading spacing level="2" size="medium">
          Velkommen!
        </Heading>
        <form className="auth-dialog-box__form" action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("username", { required: true })}
            label="E-post*"
            type="email"
            autoComplete="on"
            error={blurredFields.email && errors?.username?.message}
            onBlur={() => handleFieldBlur("email")}
            onFocus={() => handleFieldFocus("email")}
          />
          <TextField
            {...register("password", { required: true })}
            label="Passord*"
            type="password"
            error={blurredFields.password && errors?.password?.message}
            onBlur={() => handleFieldBlur("password")}
            onFocus={() => handleFieldFocus("password")}
          />
          {error !== null && (
            <VStack align="center">
              {error?.name && <span className="auth-dialog-box__error-message">{error?.message}</span>}
              {error?.message === "Feil brukernavn eller passord" && (
                <a href={baseUrl(`/logg-inn/glemt-passord`)}>Glemt passord</a>
              )}
            </VStack>
          )}
          <Button type="submit">
            {isSubmitting ? (
              <div role="status">
                <Loader />
              </div>
            ) : (
              "Logg inn"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
