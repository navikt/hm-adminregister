import FormBox from "felleskomponenter/FormBox";
import { BodyShort, Button, HStack, Loader, TextField, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "api/UserApi";

export const VerifyOtp = () => {
  const [otp, setOtp] = useState<string>("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const validateFields = () => {
    const otpError = !otp || otp === "";

    if (otpError) {
      setFieldError("Du må skrive en kode");
    } else {
      setFieldError(undefined);
    }

    return !otpError;
  };

  const handleSubmitOtp = (otp: string) => {
    if (validateFields()) {
      setIsLoading(true);
      const email = location.state.email;
      verifyOtp(otp, email)
        .then(() => {
          setIsLoading(false);
          navigate(`/logg-inn/nytt-passord`, { state: { otp: otp, email: email } });
        })
        .catch(() => {
          setIsLoading(false);
          setFieldError("Noe gikk galt");
        });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormBox title="Tilbakestill passord">
      <VStack gap="space-8" style={{ width: "300px" }}>
        <BodyShort>
          Kopier inn koden du har mottatt på e-post for å tilbakestille passordet. Koden er gyldig i 30 minutter.
        </BodyShort>
        <TextField
          label={labelRequired("Kode")}
          id="otp"
          name="otp"
          type="text"
          onChange={(event) => setOtp(event.target.value)}
          error={fieldError ?? ""}
        />
        <HStack gap="space-4">
          <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
            Avbryt
          </Button>
          <Button
            type="submit"
            size="medium"
            onClick={() => {
              handleSubmitOtp(otp);
            }}
          >
            Fortsett
          </Button>
        </HStack>
      </VStack>
    </FormBox>
  );
};
