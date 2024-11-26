import FormBox from "felleskomponenter/FormBox";
import { Button, Checkbox, Loader, TextField, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { labelRequired } from "utils/string-util";
import { resetPassword } from "api/UserApi";

export const ResetPassword = () => {
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { otp } = useParams();

  const handleSubmitNewPassword = () => {
    if (validateFields()) {
      setIsLoading(true);
      const email = location.state.email;
      const otp = location.state.otp;

      resetPassword(otp, email, newPassword)
        .then(() => {
          setIsLoading(false);
          navigate("/logg-inn/kvittering");
        })
        .catch(() => {
          setIsLoading(false);
          setFieldError("Noe gikk galt");
        });
    }
  };

  const validateFields = () => {
    const newPasswordError = !newPassword || newPassword === "" || newPassword.length < 8;
    const confirmPasswordError = newPassword !== confirmPassword;

    if (newPasswordError) {
      setFieldError("Passord må inneholde minst 8 tegn.");
    } else if (confirmPasswordError) {
      setFieldError("Passordene er ikke like.");
    } else {
      setFieldError(undefined);
    }

    return !newPasswordError && !confirmPasswordError;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FormBox title="Tilbakestill passord">
      <VStack gap="7" style={{ width: "300px" }}>
        <TextField
          aria-required
          label={labelRequired("Lag nytt passord")}
          description="Minst 8 karakterer langt"
          type={isPasswordShown ? "text" : "password"}
          name="newPassword"
          autoComplete="off"
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <TextField
          aria-required
          label={labelRequired("Gjenta passord")}
          type={isPasswordShown ? "text" : "password"}
          name="confirmPassword"
          autoComplete="off"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <Checkbox onClick={() => setIsPasswordShown((prevState) => !prevState)} value="isPassShown">
          Vis passord
        </Checkbox>
        {fieldError && <span className="auth-dialog-box__error-message">{fieldError}</span>}
        <Button
          type="submit"
          onClick={() => {
            handleSubmitNewPassword();
          }}
        >
          Lagre nytt passord
        </Button>
      </VStack>
    </FormBox>
  );
};
