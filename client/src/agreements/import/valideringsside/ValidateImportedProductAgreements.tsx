import { Alert, BodyShort, Button, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { Upload } from "products/import/ImporterProdukter";
import { baseUrl } from "utils/swr-hooks";
import { importKatalogfil } from "api/ImportExportApi";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";
import { generateImportData, ImportData } from "utils/import-util";
import { ProductAgreementVariants } from "agreements/import/valideringsside/ProductAgreementVariants";
import { ProductAgreementsWithNoSeries } from "agreements/import/valideringsside/ProductAgreementsWithNoSeries";

interface Props {
  upload: Upload;
  reseetUpload: () => void;
}

export const ValidateImportedProductAgreements = ({ upload, reseetUpload }: Props) => {
  const [productAgreementsToValidate, setProductAgreementsToValidate] = useState<ProductAgreementRegistrationDTO[]>([]);
  const [importData, setImportData] = useState<ImportData | undefined>(undefined);
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
        setProductAgreementsToValidate(response.productAgreements);
        const importData_ = generateImportData(response.productAgreements);
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
        setProductAgreementsToValidate(response.productAgreements);
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
              <BodyShort>
                Importeringen var vellykket. Du kan nå gå til{" "}
                <a href={baseUrl(`/rammeavtaler/${productAgreementsToValidate[0].agreementId}`)}>rammeavtalen</a> for å
                se de importerte produktene.
              </BodyShort>
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

            {!isLoading && productAgreementsToValidate.length > 0 && importData && (
              <VStack gap="6">
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
                    onClick={(event) => {
                      importer();
                    }}
                  >
                    Importer
                  </Button>
                </HStack>

                <ProductAgreementsWithNoSeries productAgreements={importData.productAgreementsWithNoSeries ?? []} />

                {importData?.groupedProductAgreements?.map((productAgreementSeries, i) => {
                  return (
                    <div>
                      <ProductAgreementVariants
                        key={i}
                        title={productAgreementSeries.title}
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
