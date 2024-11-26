import { BodyShort, VStack } from "@navikt/ds-react";
import FormBox from "felleskomponenter/FormBox";

export const PasswordResetReceit = () => {
  return (
    <FormBox title="Passordet er tilbakestilt.">
      <VStack gap="7" style={{ width: "300px" }}>
        <BodyShort>
          Du kan nå <a href={"/"}> logge inn med ditt nye passord.</a>
        </BodyShort>
      </VStack>
    </FormBox>
  );
};
