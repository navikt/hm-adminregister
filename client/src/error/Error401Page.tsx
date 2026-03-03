import { BodyShort, Box, Button, Heading, HGrid, Link, Page, VStack } from "@navikt/ds-react";
import { useNavigate } from "react-router-dom";
import { FallbackProps } from "react-error-boundary";

export const Error401Page = ({ error, resetErrorBoundary }: FallbackProps) => {
  const navigate = useNavigate();

  return (
    <Page data-aksel-template="500-v2">
      <Page.Block as="main" width="xl" gutters>
        <Box paddingBlock="space-20 space-8">
          <HGrid columns="minmax(auto,600px)">
            <VStack gap="space-16">
              <VStack gap="space-12" align="start">
                <div>
                  <Heading level="1" size="large" spacing>
                    Du er logget ut!
                  </Heading>
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
                    navigate("/logg-inn");
                  }}
                >
                  Logg inn
                </Button>
              </VStack>
              <div>
                <Heading level="1" size="large" spacing>
                  You are logged out!
                </Heading>
                <BodyShort spacing>
                  This was caused by a technical fault on our servers. Please refresh this page or try again in a few
                  minutes.{" "}
                </BodyShort>
                <BodyShort>
                  <Link target="_blank" href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
                    Contact us by mail
                  </Link>
                  {""}
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
