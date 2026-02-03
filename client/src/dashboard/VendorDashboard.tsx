import { BodyShort, Heading, HStack, VStack, Box } from "@navikt/ds-react";
import { usePagedParts } from "api/PartApi";
import { usePagedProducts } from "utils/swr-hooks";
import { Link } from "react-router-dom";

const VendorDashboard = () => {
  const { data: mainProductsOnAgreementData } = usePagedProducts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    filters: [],
    agreementFilter: "true",
    missingMediaType: "IMAGE",
  });

  const { data: mainProductsNotOnAgreementData } = usePagedProducts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    filters: [],
    agreementFilter: "false",
    missingMediaType: "IMAGE",
  });

  const mainProductsOnAgreementCount = mainProductsOnAgreementData?.totalSize ?? 0;
  const mainProductsNotOnAgreementCount = mainProductsNotOnAgreementData?.totalSize ?? 0;

  const { data: partsOnAgreementData } = usePagedParts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    agreementFilter: "true",
    missingMediaType: "IMAGE",
  });

  const { data: partsNotOnAgreementData } = usePagedParts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    agreementFilter: "false",
    missingMediaType: "IMAGE",
  });

  const partsOnAgreementCount = partsOnAgreementData?.totalSize ?? 0;
  const partsNotOnAgreementCount = partsNotOnAgreementData?.totalSize ?? 0;

  const isLoading = !mainProductsOnAgreementData || !mainProductsNotOnAgreementData;

  return (
    <main className="show-menu">
      <VStack gap="8" style={{ maxWidth: "75rem" }}>
        <Heading level="1" size="large" spacing>
          Dashboard
        </Heading>

        <Heading level="2" size="medium" spacing>
          Produkter uten bilde
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
              <Link to="/produkter?missingMediaType=IMAGE&inAgreement=true">
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
              Antall produkter som er på en rammeavtale og mangler bilde.
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
              <Link to="/produkter?missingMediaType=IMAGE&inAgreement=false">
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
              Antall produkter som ikke er på rammeavtale og mangler bilde.
            </BodyShort>
          </Box>
        </HStack>

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
              <Link to="/deler?missingMediaType=IMAGE&inAgreement=true">
                <Heading level="3" size="large" spacing>
                  {partsOnAgreementCount}
                </Heading>
              </Link>
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
              <Link to="/deler?missingMediaType=IMAGE&inAgreement=false">
                <Heading level="3" size="large" spacing>
                  {partsNotOnAgreementCount}
                </Heading>
              </Link>
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
