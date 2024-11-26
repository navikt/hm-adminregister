import FormBox from "felleskomponenter/FormBox";
import { BodyShort, Button, HStack, Loader, TextField, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { requestOtpForPasswordReset } from "api/UserApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSendOtpRequest = () => {
    if (validateFields()) {
      setIsLoading(true);
      requestOtpForPasswordReset(email)
        .then((response) => {
          setIsLoading(false);
          navigate("/logg-inn/send-kode", { state: { email: email } });
        })
        .catch((error) => {
          setIsLoading(false);
          setFieldError("Noe gikk galt, prøv igjen senere");
        });
    }
  };

  const validateFields = () => {
    const emailError = !email || email === "";
    const emailFormatError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (emailError) {
      setFieldError("Du må skrive en e-postadresse");
    } else if (emailFormatError) {
      setFieldError("Ugyldig format på e-postadresse");
    } else {
      setFieldError(undefined);
    }

    return !emailError && !emailFormatError;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormBox title="Tilbakestill passord">
      <VStack gap="7" style={{ width: "300px" }}>
        <BodyShort>
          Du vil motta en e-post med en kode som benyttes for å tilbakestille passordet i neste steg.
        </BodyShort>
        <TextField
          label={labelRequired("E-post")}
          id="email"
          name="email"
          type="email"
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError ?? ""}
        />
        <HStack gap="4">
          <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
            Avbryt
          </Button>
          <Button
            type="submit"
            size="medium"
            onClick={() => {
              handleSendOtpRequest();
            }}
          >
            Fortsett
          </Button>
        </HStack>
      </VStack>
    </FormBox>
  );
};
