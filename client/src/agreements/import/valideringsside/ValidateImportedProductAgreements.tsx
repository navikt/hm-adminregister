import { Alert, BodyShort, Box, Button, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { Upload } from "products/import/ImporterProdukter";
import { baseUrl } from "utils/swr-hooks";
import { importKatalogfil } from "api/ImportExportApi";
import { ProductAgreementRegistrationDTO, ProductAgreementsWithInformation } from "utils/types/response-types";
import { GroupedProductAgreements, groupProductAgreementsBySeries } from "utils/import-util";
import { ProductAgreementVariants } from "agreements/import/valideringsside/ProductAgreementVariants";

interface Props {
  upload: Upload;
  reseetUpload: () => void;
}

export const ValidateImportedProductAgreements = ({ upload, reseetUpload }: Props) => {
  const [productAgreementsToValidate, setProductAgreementsToValidate] = useState<ProductAgreementRegistrationDTO[]>([]);
  const [productAgreementsWithInformation, setProductAgreementsWithInformation] =
    useState<ProductAgreementsWithInformation>([]);
  const [importData, setImportData] = useState<GroupedProductAgreements | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [importSuccessful, setImportSuccessful] = useState(false);

  useEffect(() => {
    importerDryrun();
  }, []);

  const importerDryrun = () => {
    setIsLoading(true);
    importKatalogfil(upload, true)
      .then((response) => {
        const productAgreeementsToValidate = response.productAgreementsWithInformation.map((productAgreement) => {
          return productAgreement.first;
        });
        setProductAgreementsWithInformation(response.productAgreementsWithInformation);
        setProductAgreementsToValidate(productAgreeementsToValidate);
        const importData_ = groupProductAgreementsBySeries(productAgreeementsToValidate, response.createdSeries);
        setImportData(importData_);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  const importer = () => {
    setIsLoading(true);

    importKatalogfil(upload, false)
      .then((response) => {
        const productAgreeementsToValidate = response.productAgreementsWithInformation.map((productAgreement) => {
          return productAgreement.first;
        });
        setProductAgreementsWithInformation(response.productAgreementsWithInformation);
        setProductAgreementsToValidate(productAgreeementsToValidate);
        const importData_ = groupProductAgreementsBySeries(productAgreeementsToValidate, response.createdSeries);
        setImportData(importData_);
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
              {importData?.newAccessories || importData?.newHovedprodukts || importData?.newSpareParts ? (
                <BodyShort>
                  Det ble opprettet nye produkter i import som ligger{" "}
                  <a href={baseUrl(`/rammeavtaler/${productAgreementsToValidate[0].agreementId}`)}>til godkjenning</a>
                </BodyShort>
              ) : (
                <BodyShort>
                  Importeringen var vellykket. Du kan nå gå til{" "}
                  <a href={baseUrl(`/rammeavtaler/${productAgreementsToValidate[0].agreementId}`)}>rammeavtalen</a> for
                  å se de importerte produktene.
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
              Importer katalogfil
            </Heading>
            {isLoading && <Loader size="2xlarge" />}

            {!isLoading && productAgreementsWithInformation.length > 0 && importData && (
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
                    Nye hovedprodukter: <b>{importData.newHovedprodukts}</b>
                  </HStack>
                  <HStack gap="1">
                    Nye reservedeler: <b>{importData.newSpareParts}</b>
                  </HStack>
                  <HStack gap="1">
                    Nye tilbehør: <b>{importData.newAccessories}</b>
                  </HStack>
                </Box>

                {importData?.groupedProductAgreements?.map((productAgreementSeries, i) => {
                  return (
                    <div key={i}>
                      <ProductAgreementVariants
                        key={i}
                        title={productAgreementSeries.title}
                        accessory={productAgreementSeries.accessory}
                        sparePart={productAgreementSeries.sparePart}
                        newProduct={productAgreementSeries.newProduct}
                        variants={productAgreementSeries.variants}
                      />
                    </div>
                  );
                })}
              </VStack>
            )}
          </div>
        </div>
      </main>
    );
  }
};
