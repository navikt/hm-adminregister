import { Alert, BodyShort, Box, Button, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { baseUrl } from "utils/swr-hooks";
import { importKatalogfil } from "api/ImportExportApi";
import { ProductAgreementRegistrationDTO, ProductRegistration, SeriesRegistrations } from "utils/types/response-types";
import { Upload } from "felleskomponenter/FellesImport";

interface Props {
  upload: Upload;
  reseetUpload: () => void;
  supplier: string;
}

export const ValidateImportedProductAgreements = ({ upload, reseetUpload, supplier }: Props) => {
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
        <div className="import-products">
          <div className="content">
            <Heading level="1" size="large" align="center">
              Importer produkter
            </Heading>
            <p>
              {(newProductAgreements.length > 0 ||
                updatedProductAgreements.length > 0 ||
                deactivatedProductAgreements.length > 0) && (
                <BodyShort>
                  Importeringen var vellykket. Du kan nå gå til{" "}
                  <a href={baseUrl(`/rammeavtaler/${newProductAgreements[0].agreementId}`)}>rammeavtalen</a> for å se de
                  importerte produktene.
                </BodyShort>
              )}
            </p>
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
                reseetUpload();
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
              Importer katalogfil her
            </Heading>
            {isLoading && <Loader size="2xlarge" />}

            {!isLoading &&
              (newProductAgreements.length > 0 ||
                updatedProductAgreements.length > 0 ||
                deactivatedProductAgreements.length > 0 ||
                createdMainProducts.length > 0 ||
                createdAccessoryParts.length > 0) && (
                <VStack gap="4">
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

                  <Box padding="2">
                    <HStack gap="1">
                      Nye hovedprodukter: <b>{createdMainProducts.length}</b>
                    </HStack>
                    <HStack gap="1">
                      Nye reservedeler/tilbehør: <b>{createdAccessoryParts.length}</b>
                    </HStack>
                    <HStack gap="1">
                      Nye produkter på delkontrakter: <b>{newProductAgreements.length}</b>
                    </HStack>
                    <HStack gap="1">
                      Oppdaterte produkter på delkontrakter: <b>{updatedProductAgreements.length}</b>
                    </HStack>
                    <HStack gap="1">
                      Deaktiverte produkter på delkontrakter: <b>{deactivatedProductAgreements.length}</b>
                    </HStack>
                  </Box>
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
