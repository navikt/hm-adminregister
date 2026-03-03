import { BodyShort, Box, Button, Heading, HGrid, Link, List, Page, VStack } from "@navikt/ds-react";
import { FallbackProps } from "react-error-boundary";

export const ErrorPage = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Page data-aksel-template="500-v2">
      <Page.Block as="main" width="xl" gutters>
        <Box paddingBlock="space-20 space-8">
          <HGrid columns="minmax(auto,600px)">
            <VStack gap="space-16">
              <VStack gap="space-12" align="start">
                <div>
                  <BodyShort textColor="subtle" size="small">
                    {error.status + " " + error.message}
                  </BodyShort>
                  <Heading level="1" size="large" spacing>
                    Beklager, noe gikk galt.
                  </Heading>
                  <BodyShort spacing>
                    En teknisk feil på våre servere gjør at siden er utilgjengelig. Dette skyldes ikke noe du gjorde.
                  </BodyShort>
                  <BodyShort>Du kan prøve å</BodyShort>
                  <List>
                    <List.Item>
                      vente noen minutter og{" "}
                      <Link
                        href="#"
                        onClick={() => {
                          location.reload();
                          resetErrorBoundary();
                        }}
                      >
                        laste siden på nytt
                      </Link>
                    </List.Item>
                    <List.Item>
                      {/* Vurder å sjekke at window.history.length > 1 før dere rendrer dette som en lenke */}
                      <Link
                        href="#"
                        onClick={() => {
                          history.back();
                          resetErrorBoundary();
                        }}
                      >
                        gå tilbake til forrige side
                      </Link>
                    </List.Item>
                  </List>
                  <BodyShort>
                    Hvis problemet vedvarer, kan du sende oss en e-post{" "}
                    <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
                      digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
                    </a>
                  </BodyShort>
                </div>

                <Button
                  onClick={() => {
                    resetErrorBoundary();
                    location.href = "/";
                  }}
                >
                  Gå til startsiden
                </Button>
              </VStack>
              <div>
                <Heading level="1" size="large" spacing>
                  Something went wrong
                </Heading>
                <BodyShort spacing>
                  This was caused by a technical fault on our servers. Please refresh this page or try again in a few
                  minutes.{" "}
                </BodyShort>
                <BodyShort>
                  <Link target="_blank" href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
                    Contact us by mail
                  </Link>{" "}
                  if the problem persists.
                </BodyShort>
              </div>
            </VStack>
          </HGrid>
        </Box>
      </Page.Block>
    </Page>
  );
};
