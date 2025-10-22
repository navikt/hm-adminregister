import { Alert, BodyShort, Box, Button, ExpansionCard, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { baseUrl } from "utils/swr-hooks";
import { importKatalogfil } from "api/ImportExportApi";
import {
    CatalogImport
} from "utils/types/response-types";
import { Upload } from "felleskomponenter/FellesImport";
import { CatalogImportsTable } from "catalog/import/valideringsside/CatalogImportsTable";

interface Props {
  upload: Upload;
  resetUpload: () => void;
  supplier: string;
}

export const ValidateImportedCatalogImports = ({ upload, resetUpload, supplier }: Props) => {
  const [insertedList, setInsertedCatalogImports] = useState<CatalogImport[]>([]);
  const [updatedList, setUpdatedCatalogImports] = useState<CatalogImport[]>([]);
  const [deactivatedList, setDeactivatedCatalogImports] = useState<CatalogImport[]>(
    [],
  );

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
        setInsertedCatalogImports(response.insertedList);
        setUpdatedCatalogImports(response.updatedList);
        setDeactivatedCatalogImports(response.deactivatedList);
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
        setInsertedCatalogImports(response.insertedList);
        setUpdatedCatalogImports(response.updatedList);
        setDeactivatedCatalogImports(response.deactivatedList);
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
                <a href={baseUrl("/katalog/importer-fil")}>Gå til ny import</a>
              </BodyShort>
                <BodyShort size="large">
                    <a href={baseUrl("/katalog")}>Gå til katalog siden</a>
                </BodyShort>
              {(insertedList.length > 0) && (
                <BodyShort size="medium">
                  Det ble opprettet nye produkter/deler/tilbehør i import, disse vil ligge{" "}
                  <a href={baseUrl(`/til-godkjenning?filter=ADMIN`)}> til godkjenning</a>.
                </BodyShort>
              )}
              {(insertedList.length > 0 ||
                updatedList.length > 0 ||
                deactivatedList.length > 0) && (
                <BodyShort size="medium">
                  Importeringen var vellykket. Etter noen minutter, blir de nye tilknytningene tilgjengelig på{" "}
                  {insertedList.length > 0 ? (
                    <a href={baseUrl(`/rammeavtaler/${insertedList[0]?.agreementId}`)}>rammeavtalen</a>
                  ) : updatedList.length > 0 ? (
                    <a href={baseUrl(`/rammeavtaler/${updatedList[0]?.agreementId}`)}>rammeavtalen</a>
                  ) : (
                    <a href={baseUrl(`/rammeavtaler/${deactivatedList[0]?.agreementId}`)}>rammeavtalen</a>
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
              (insertedList.length > 0 ||
                updatedList.length > 0 ||
                deactivatedList.length > 0) && (
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

                  {insertedList.length > 0 ? (
                    <ExpansionCard aria-label="Nye produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Nye produkter på delkontrakter ({insertedList.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <CatalogImportsTable catalogImports={insertedList} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen nye produkter på delkontrakter
                    </Alert>
                  )}

                  {updatedList.length > 0 ? (
                    <ExpansionCard aria-label="Oppdaterte produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Oppdaterte produkter på delkontrakter ({updatedList.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <CatalogImportsTable catalogImports={updatedList} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  ) : (
                    <Alert inline variant="info" size="medium">
                      Ingen oppdaterte produkter på delkontrakter
                    </Alert>
                  )}

                  {deactivatedList.length > 0 ? (
                    <ExpansionCard aria-label="Deaktiverte produkter på delkontrakter">
                      <ExpansionCard.Header>
                        <Heading level="2" size="medium">
                          Deaktiverte produkter på delkontrakter ({deactivatedList.length})
                        </Heading>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <CatalogImportsTable catalogImports={deactivatedList} />
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
              insertedList.length === 0 &&
              updatedList.length === 0 &&
              deactivatedList.length === 0 && (
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
