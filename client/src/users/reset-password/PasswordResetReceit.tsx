import { BodyShort, VStack } from "@navikt/ds-react";
import FormBox from "felleskomponenter/FormBox";
import { baseUrl } from "utils/swr-hooks";

export const PasswordResetReceit = () => {
  return (
    <FormBox title="Passordet er tilbakestilt.">
      <VStack gap="7" style={{ width: "300px" }}>
        <BodyShort>
          Du kan nå <a href={baseUrl("/")}> logge inn med ditt nye passord.</a>
        </BodyShort>
      </VStack>
    </FormBox>
  );
};
