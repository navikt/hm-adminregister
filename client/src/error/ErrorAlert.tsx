import { Alert, HGrid } from "@navikt/ds-react";

const ErrorAlert = () => {
  return (
    <HGrid gap="space-12" columns="minmax(16rem, 55rem)">
      <Alert variant="error">
        Kunne ikke vise innholdet. Prøv å laste siden på nytt. Hvis problemet vedvarer, kan du sende oss en e-post{" "}
        <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
          digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
        </a>
      </Alert>
    </HGrid>
  );
};

export default ErrorAlert
