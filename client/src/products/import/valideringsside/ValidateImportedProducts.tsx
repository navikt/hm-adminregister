import { Alert, BodyShort, Button, ExpansionCard, Heading, HStack, Loader } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "utils/store/useAuthStore";
import { Product } from "utils/types/types";
import { mapProductRegistrationDTOToProduct } from "utils/product-util";
import { ProductSeriesInfo } from "products/import/valideringsside/ProductSeriesInfo";
import { VariantsTable } from "products/import/valideringsside/VariantsTable";
import { baseUrl, useSeries } from "utils/swr-hooks";
import { importProducts } from "api/ImportExportApi";
import { Upload } from "felleskomponenter/FellesImport";

interface Props {
  upload: Upload;
  reseetUpload: () => void;
  seriesId: string;
}

export const ValidateImportedProducts = ({ upload, reseetUpload, seriesId }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [productsToValidate, setProductsToValidate] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [importSuccessful, setImportSuccessful] = useState(false);
  const { series, isLoadingSeries, errorSeries } = useSeries(seriesId);

  useEffect(() => {
    importerDryrun();
  }, []);

  const importerDryrun = () => {
    setIsLoading(true);
    importProducts(loggedInUser?.isAdmin || false, seriesId, upload, true)
      .then((response) => {
        const products = mapProductRegistrationDTOToProduct(response);
        setProductsToValidate(products);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error);
        setIsLoading(false);
      });
  };

  const importer = () => {
    setIsLoading(true);

    importProducts(loggedInUser?.isAdmin || false, seriesId, upload, false)
      .then((response) => {
        const products = mapProductRegistrationDTOToProduct(response);
        setProductsToValidate(products);
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
              Importeringen var vellykket.
            </Heading>
            <p>
              <BodyShort>
                Du kan nå gå til <a href={baseUrl(`/produkter/${seriesId}`)}>produksiden</a> og sende produktserien til
                godkjenning eller se over endringene.
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
              Importer produkter
            </Heading>
            {isLoading && <Loader size="2xlarge" />}

            {!isLoading && productsToValidate.length > 0 && (
              <HStack gap="6">
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

                {productsToValidate.map((product, i) => {
                  return (
                    <ExpansionCard
                      key={i}
                      aria-label="Produktserie med varianter"
                      style={{ width: "90vw" }}
                      size="small"
                      open={true}
                    >
                      <ExpansionCard.Header>
                        <ExpansionCard.Title>{series?.title}</ExpansionCard.Title>
                        <ExpansionCard.Description>
                          <ProductSeriesInfo product={product} />
                        </ExpansionCard.Description>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <VariantsTable product={product} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  );
                })}
              </HStack>
            )}
          </div>
        </div>
      </main>
    );
  }
};
