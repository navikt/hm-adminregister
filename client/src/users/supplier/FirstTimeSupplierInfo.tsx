import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { Buldings3Icon, ComponentIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, Heading, Label, Loader, TextField } from "@navikt/ds-react";
import { HM_REGISTER_URL } from "environments";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { formatPhoneNumber, labelRequired } from "utils/string-util";
import { useSupplier } from "utils/swr-hooks";
import { SupplierRegistrationDTO } from "utils/types/response-types";
import { supplierInfoUpdate } from "utils/zodSchema/login";

type FormData = z.infer<typeof supplierInfoUpdate>;

interface BlurredFields {
  homepage: boolean;
  email: boolean;
  phone: boolean;
}

const FirstTimeSupplierInfo = () => {
  const { loggedInUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { supplier, supplierError, supplierIsLoading, supplierMutate } = useSupplier(loggedInUser?.isAdmin);

  //TODO: Gjør dette fordi supplierIsLoading er false første render så skjema vises ikke (heller ikke loader)
  // så her må vi se på en bedre løsning
  useEffect(() => {
    if (supplier || supplierError) {
      setLoading(false);
    }
  }, [supplier, supplierError, supplierIsLoading]);

  if (supplierIsLoading || loading) return <Loader size="3xlarge" title="Henter leverandørinformasjon" />;

  return (
    <main>
      <div className="auth-page">
        <span className="logo-and-name-container">
          <ComponentIcon aria-hidden fontSize="3rem" />
          <Heading level="1" size="small" className="name">
            <span>FinnHjelpemiddel</span>
            <span>Admin</span>
          </Heading>
        </span>
        <div className="auth-dialog-box__container auth-dialog-box__container--max-width">
          <Buldings3Icon fontSize="1.5rem" aria-hidden />
          <Heading spacing level="2" size="medium" align="center">
            Før du går videre trenger vi også litt mer informasjon om leverandøren du representerer.
          </Heading>
          {supplier && <SupplierInfoUpdateForm supplier={supplier} mutate={supplierMutate} />}
        </div>
      </div>
    </main>
  );
};

export default FirstTimeSupplierInfo;

const SupplierInfoUpdateForm = ({ supplier, mutate }: { supplier: SupplierRegistrationDTO; mutate: any }) => {
  const { setGlobalError } = useErrorStore();
  const [blurredFields, setBlurredFields] = useState<BlurredFields>({
    homepage: false,
    email: false,
    phone: false,
  });
  const [phoneValue, setPhoneValue] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(supplierInfoUpdate),
    mode: "onChange",
    defaultValues: {
      homepage: supplier.supplierData.homepage || "",
      email: supplier.supplierData.email || "",
      phone: supplier.supplierData.phone || "",
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
    const supplierBody = {
      ...supplier,
      supplierData: {
        ...supplier.supplierData,
        homepage: data.homepage,
        email: data.email,
        phone: cleanedPhoneNumber || "",
      },
    };

    const supplierJSON = JSON.stringify(supplierBody);
    setLoading(true);
    const response = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/supplier/registrations`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: supplierJSON,
    });

    if (response.ok) {
      mutate({ ...supplierBody });
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

  if (isLoading) return <Loader size="3xlarge" title="Sender..." />;

  return (
    <form className="auth-dialog-box__form" action="" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label>Leverandør</Label>
        <BodyShort style={{ marginLeft: "8px", marginTop: "8px" }}>{supplier?.name}</BodyShort>
      </div>
      <TextField
        {...register("homepage", { required: true })}
        label={labelRequired("Nettside")}
        autoComplete="on"
        onBlur={() => handleFieldBlur("homepage")}
        onFocus={() => handleFieldFocus("name")}
        error={errors?.homepage && errors?.homepage?.message}
      />
      <TextField
        {...register("email", { required: true })}
        label={labelRequired("E-post")}
        autoComplete="on"
        onBlur={() => handleFieldBlur("email")}
        onFocus={() => handleFieldFocus("email")}
        error={blurredFields.email && errors?.email?.message}
      />
      <TextField
        {...register("phone", { required: true })}
        label={labelRequired("Telefonnummer")}
        id="phoneNumber"
        type="text"
        name="phone"
        autoComplete="on"
        onBlur={() => handleFieldBlur("phone")}
        onFocus={() => handleFieldFocus("phone")}
        error={blurredFields.phone && errors?.phone?.message}
      />
      <Button type="submit">
        {isSubmitting ? (
          <div role="status">
            <Loader />
          </div>
        ) : (
          "Neste"
        )}
      </Button>
      {error?.name && (
        <p>
          <span className="auth-dialog-box__error-message">{error?.message}</span>
        </p>
      )}
    </form>
  );
};
