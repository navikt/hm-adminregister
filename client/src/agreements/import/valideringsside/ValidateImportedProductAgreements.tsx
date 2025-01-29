import { Alert, BodyShort, Box, Button, ExpansionCard, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { baseUrl } from "utils/swr-hooks";
import { importKatalogfil } from "api/ImportExportApi";
import { ProductAgreementRegistrationDTO, ProductRegistration, SeriesRegistrations } from "utils/types/response-types";
import { Upload } from "felleskomponenter/FellesImport";
import { ProductRegistrationTable } from "agreements/import/valideringsside/ProductRegistrationTable";
import { ProductAgreementsTable } from "agreements/import/valideringsside/ProductAgreementsTable";

interface Props {
  upload: Upload;
  resetUpload: () => void;
  supplier: string;
}

export const ValidateImportedProductAgreements = ({ upload, resetUpload, supplier }: Props) => {
  const [newProductAgreements, setNewProductAgreements] = useState<ProductAgreementRegistrationDTO[]>([]);
  const [updatedProductAgreements, setUpdatedProductAgreements] = useState<ProductAgreementRegistrationDTO[]>([]);
  const [deactivatedProductAgreements, setDeactivatedProductAgreements] = useState<ProductAgreementRegistrationDTO[]>(
    [],
  );
  const [createdSeries, setCreatedSeries] = useState<SeriesRegistrations>([]);
  const [createdMainProducts, setCreatedMainProducts] = useState<ProductRegistration[]>([]);
  const [createdAccessoryParts, setCreatedAccessoryParts] = useState<ProductRegistration[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [importSuccessful, setImportSuccessful] = useState(false);

  useEffect(() => {
    importerDryrun(supplier);
  }, []);

  const importerDryrun = (supplier: string) => {
    setIsLoading(true);
    importKatalogfil(upload, true, supplier)
      .then((response) => {
        setNewProductAgreements(response.newProductAgreements);
        setUpdatedProductAgreements(response.updatedAgreements);
        setDeactivatedProductAgreements(response.deactivatedAgreements);
        setCreatedSeries(response.createdSeries);
        setCreatedMainProducts(response.createdMainProducts);
        setCreatedAccessoryParts(response.createdAccessoryParts);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  const importer = () => {
    setIsLoading(true);

    importKatalogfil(upload, false, supplier)
      .then((response) => {
        const productAgreeementsToValidate = response.productAgreementsWithInformation.map((productAgreement) => {
          return productAgreement.first;
        });
        setNewProductAgreements(response.newProductAgreements);
        setUpdatedProductAgreements(response.updatedAgreements);
        setDeactivatedProductAgreements(response.deactivatedAgreements);
        setCreatedSeries(response.createdSeries);
        setCreatedMainProducts(response.createdMainProducts);
        setCreatedAccessoryParts(response.createdAccessoryParts);
        setIsLoading(false);
        setImportSuccessful(true);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  if (importSuccessful) {
    return (
      <main>
        <div className={"import-products"}>
          <div className="content">
            <Heading level="1" size="large" align="center">
              Import av produkter var vellykket
            </Heading>

            <VStack gap="4">
              <BodyShort size="large">
                <a href={baseUrl("/rammeavtaler/importer-katalogfil")}>Gå til ny import</a>
              </BodyShort>
              {(createdMainProducts.length > 0 || createdAccessoryParts.length > 0) && (
                <BodyShort size="medium">
                  Det ble opprettet nye produkter/deler/tilbehør i import, disse ligger{" "}
                  <a href={baseUrl(`/til-godkjenning?filter=ADMIN`)}> til godkjenning</a>.
                </BodyShort>
              )}
              {(newProductAgreements.length > 0 ||
                updatedProductAgreements.length > 0 ||
                deactivatedProductAgreements.length > 0) && (
                <BodyShort size="medium">
                  Importeringen var vellykket. Du kan se de nye tilknytningene på{" "}
                  {newProductAgreements.length > 0 ? (
                    <a href={baseUrl(`/rammeavtaler/${newProductAgreements[0]?.agreementId}`)}>rammeavtalen</a>
                  ) : updatedProductAgreements.length > 0 ? (
                    <a href={baseUrl(`/rammeavtaler/${updatedProductAgreements[0]?.agreementId}`)}>rammeavtalen</a>
                  ) : (
                    <a href={baseUrl(`/rammeavtaler/${deactivatedProductAgreements[0]?.agreementId}`)}>rammeavtalen</a>
                  )}
                </BodyShort>
              )}
            </VStack>
          </div>
        </div>
      </main>
    );
  } else if (error) {
    return (
      <main>
        <div className="import-products">
          <div className="content">
            <Heading level="1" size="large" align="center">
              Importer produkter
            </Heading>
            <Alert variant="error">{error.message}</Alert>
            <Button
              className="fit-content"
              size="medium"
              variant="secondary"
              iconPosition="right"
              onClick={() => {
                resetUpload();
              }}
            >
              Avbryt
            </Button>
          </div>
        </div>
      </main>
    );
  } else {
    return (
      <main>
        <div className="import-products">
          <div className="content">
            <Heading level="1" size="large" align="center">
              Importer katalogfil
            </Heading>
            {isLoading && <Loader size="2xlarge" />}

            {!isLoading &&
              (newProductAgreements.length > 0 ||
                updatedProductAgreements.length > 0 ||
                deactivatedProductAgreements.length > 0 ||
                createdMainProducts.length > 0 ||
                createdAccessoryParts.length > 0) && (
                <VStack gap="4" minWidth="768px">
                  <HStack gap="4">
                    <Button
                      className="fit-content"
                      size="medium"
                      variant="secondary"
                      iconPosition="right"
                      onClick={() => {
                        history.back();
                      }}
                    >
                      Avbryt
                    </Button>
                    <Button
                      className="fit-content"
                      size="medium"
                      variant="primary"
                      iconPosition="right"
                      onClick={() => {
                        importer();
                      }}
                    >
                      Importer
                    </Button>
                  </HStack>

                  {createdMainProducts.length > 0 ? (
                    <ExpansionCard aria-label="Nye hovedprodukter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Nye hovedprodukter ({createdMainProducts.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <ProductRegistrationTable productRegistrations={createdMainProducts} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen nye hovedprodukter
                    </Alert>
                  )}
                  {createdAccessoryParts.length > 0 ? (
                    <ExpansionCard aria-label="Nye reservedeler/tilbehør">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Nye reservedeler/tilbehør ({createdAccessoryParts.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <ProductRegistrationTable productRegistrations={createdAccessoryParts} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen nye reservedeler/tilbehør
                    </Alert>
                  )}

                  {newProductAgreements.length > 0 ? (
                    <ExpansionCard aria-label="Nye produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Nye produkter på delkontrakter ({newProductAgreements.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <ProductAgreementsTable productAgreements={newProductAgreements} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen nye produkter på delkontrakter
                    </Alert>
                  )}

                  {updatedProductAgreements.length > 0 ? (
                    <ExpansionCard aria-label="Oppdaterte produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Oppdaterte produkter på delkontrakter ({updatedProductAgreements.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <ProductAgreementsTable productAgreements={updatedProductAgreements} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen oppdaterte produkter på delkontrakter
                    </Alert>
                  )}

                  {deactivatedProductAgreements.length > 0 ? (
                    <ExpansionCard aria-label="Deaktiverte produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Deaktiverte produkter på delkontrakter ({deactivatedProductAgreements.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <ProductAgreementsTable productAgreements={deactivatedProductAgreements} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen deaktiverte produkter på delkontrakter
                    </Alert>
                  )}
                </VStack>
              )}

            {!isLoading &&
              newProductAgreements.length === 0 &&
              updatedProductAgreements.length === 0 &&
              deactivatedProductAgreements.length === 0 &&
              createdMainProducts.length === 0 &&
              createdAccessoryParts.length === 0 && (
                <VStack gap="4">
                  <Button
                    className="fit-content"
                    size="medium"
                    variant="secondary"
                    iconPosition="right"
                    onClick={() => {
                      history.back();
                    }}
                  >
                    Avbryt
                  </Button>
                  <Box>
                    <BodyShort>Ingen nye produkter eller tilknytninger å importere</BodyShort>
                  </Box>
                </VStack>
              )}
          </div>
        </div>
      </main>
    );
  }
};
