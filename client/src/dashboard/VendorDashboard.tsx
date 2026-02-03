import { BodyShort, Heading, HStack, VStack, Box } from "@navikt/ds-react";
import { useSeriesWithoutMediaByAgreement } from "api/SeriesApi";
import { Link } from "react-router-dom";

const VendorDashboard = () => {
  const { data: mainProductsWithoutImages, error } = useSeriesWithoutMediaByAgreement("IMAGE", true);
  const { data: partsWithoutImages } = useSeriesWithoutMediaByAgreement("IMAGE", false);

  const mainProductsOnAgreementCount = mainProductsWithoutImages?.onAgreement.length ?? 0;
  const mainProductsNotOnAgreementCount = mainProductsWithoutImages?.notOnAgreement.length ?? 0;

  const partsOnAgreementCount = partsWithoutImages?.onAgreement.length ?? 0;
  const partsNotOnAgreementCount = partsWithoutImages?.notOnAgreement.length ?? 0;

  const isLoading = !mainProductsWithoutImages && !error;

  return (
    <main className="show-menu">
      <VStack gap="8" style={{ maxWidth: "75rem" }}>
        <Heading level="1" size="large" spacing>
          Dashboard
        </Heading>

        {error && (
          <BodyShort size="small" as="p">
            Kunne ikke hente tall for serier uten bilde. Prøv igjen senere.
          </BodyShort>
        )}

        {/* Hovedprodukter uten bilde */}
        <Heading level="2" size="medium" spacing>
          Hovedprodukter uten bilde
        </Heading>
        <HStack gap="6" wrap>
          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", flex: 1 }}
          >
            <Heading level="3" size="small">
              På rammeavtale
            </Heading>
            {isLoading ? (
              <Heading level="3" size="large" spacing>
                …
              </Heading>
            ) : mainProductsOnAgreementCount > 0 ? (
              <Link to="/produkter?missingMediaType=IMAGE&inAgreement=true&mainProduct=true">
                <Heading level="3" size="large" spacing>
                  {mainProductsOnAgreementCount}
                </Heading>
              </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {mainProductsOnAgreementCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall hovedprodukter som er på en rammeavtale og mangler bilde.
            </BodyShort>
          </Box>

          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", flex: 1 }}
          >
            <Heading level="3" size="small">
              Ikke på rammeavtale
            </Heading>
            {isLoading ? (
              <Heading level="3" size="large" spacing>
                …
              </Heading>
            ) : mainProductsNotOnAgreementCount > 0 ? (
              <Link to="/produkter?missingMediaType=IMAGE&inAgreement=false&mainProduct=true">
                <Heading level="3" size="large" spacing>
                  {mainProductsNotOnAgreementCount}
                </Heading>
              </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {mainProductsNotOnAgreementCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall hovedprodukter som ikke er på rammeavtale og mangler bilde.
            </BodyShort>
          </Box>
        </HStack>

        {/* Deler uten bilde */}
        <Heading level="2" size="medium" spacing>
          Deler uten bilde
        </Heading>
        <HStack gap="6" wrap>
          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", flex: 1 }}
          >
            <Heading level="3" size="small">
              På rammeavtale
            </Heading>
            {isLoading ? (
              <Heading level="3" size="large" spacing>
                …
              </Heading>
            ) : partsOnAgreementCount > 0 ? (
           //   <Link to="/produkter?missingMediaType=IMAGE&inAgreement=true&mainProduct=false">
                <Heading level="3" size="large" spacing>
                  {partsOnAgreementCount}
                </Heading>
           //   </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {partsOnAgreementCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall deler som er på en rammeavtale og mangler bilde.
            </BodyShort>
          </Box>

          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", flex: 1 }}
          >
            <Heading level="3" size="small">
              Ikke på rammeavtale
            </Heading>
            {isLoading ? (
              <Heading level="3" size="large" spacing>
                …
              </Heading>
            ) : partsNotOnAgreementCount > 0 ? (
             // <Link to="/produkter?missingMediaType=IMAGE&inAgreement=false&mainProduct=false">
                <Heading level="3" size="large" spacing>
                  {partsNotOnAgreementCount}
                </Heading>
             // </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {partsNotOnAgreementCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall deler som ikke er på rammeavtale og mangler bilde.
            </BodyShort>
          </Box>

        </HStack>
      </VStack>
    </main>
  );
};

export default VendorDashboard;
