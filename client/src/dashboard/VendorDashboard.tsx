import {BodyShort, Heading, HStack, VStack, Box, Loader} from "@navikt/ds-react";
import { usePagedParts } from "api/PartApi";
import { usePagedProducts } from "utils/swr-hooks";
import { Link } from "react-router-dom";

const VendorDashboard = () => {
  const { data: productsToApproveData } = usePagedProducts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    filters: ["Venter på godkjenning"],
  });

  const productsToApproveCount = productsToApproveData?.totalSize ?? 0;

  const { data: rejectedProductsData } = usePagedProducts({
    page: 0,
    pageSize: 1,
    titleSearchTerm: "",
    filters: ["Avslått"],
  });

  const rejectedProductsCount = rejectedProductsData?.totalSize ?? 0;

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
      <VStack gap="4" style={{ maxWidth: "75rem" }}>
        <Heading level="1" size="large" spacing>
          Dashboard
        </Heading>

        <Heading level="2" size="medium" style={{ marginTop: "2rem" }}>
          Produkter til godkjenning
        </Heading>
        <HStack gap="6" wrap>
          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", maxWidth: "calc(50% - 0.75rem)", flex: 1 }}
          >
            <Heading level="3" size="small">
              Venter på godkjenning
            </Heading>
            {isLoading ? (
              <Loader size="medium" />
            ) : productsToApproveCount > 0 ? (
              <Link to="/produkter?filters=Venter på godkjenning">
                <Heading level="3" size="large" spacing>
                  {productsToApproveCount}
                </Heading>
              </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {productsToApproveCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall produkter som venter på godkjenning fra HMS-bruker.
            </BodyShort>
          </Box>

          <Box
            padding="6"
            borderRadius="large"
            background="surface-subtle"
            style={{ minWidth: "16rem", maxWidth: "calc(50% - 0.75rem)", flex: 1 }}
          >
            <Heading level="3" size="small">
              Avslåtte
            </Heading>
            {isLoading ? (
                <Loader size="medium" />
            ) : rejectedProductsCount > 0 ? (
              <Link to="/produkter?filters=Avslått">
                <Heading level="3" size="large" spacing>
                  {rejectedProductsCount}
                </Heading>
              </Link>
            ) : (
              <Heading level="3" size="large" spacing>
                {rejectedProductsCount}
              </Heading>
            )}
            <BodyShort size="small">
              Antall produkter som er avslått av HMS-bruker.
            </BodyShort>
          </Box>
        </HStack>

        <Heading level="2" size="medium" style={{ marginTop: "2rem" }}>
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
                <Loader size="medium" />
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
                <Loader size="medium" />
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

        <Heading level="2" size="medium" style={{ marginTop: "2rem" }}>
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
                <Loader size="medium" />
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
                <Loader size="medium" />
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
