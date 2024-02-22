import { Button, ExpansionCard, Heading, HStack, Loader } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { importProducts } from "api/ImportApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { Product } from "utils/types/types";
import { mapProductRegistrationDTOToProduct } from "utils/product-util";
import { Upload } from "produkter/import/ImporterProdukter";
import { ProductSeriesInfo } from "produkter/import/valideringsside/ProductSeriesInfo";
import { VariantsTable } from "produkter/import/valideringsside/VariantsTable";
import { DownloadIcon, UploadIcon } from "@navikt/aksel-icons";
import { useIsoCategories } from "utils/swr-hooks";

interface Props {
  upload: Upload;
}

export const ValiderImporterteProdukter = ({ upload }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [productsToValidate, setProductsToValidate] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isoCategories, isoError } = useIsoCategories();

  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoCode + " - " + cat.isoTitle);
  //todo: avoid duplicating iso code code

  useEffect(() => {
    importerDryrun();
  }, []);

  const importerDryrun = () => {
    setIsLoading(true);
    importProducts(loggedInUser?.isAdmin || false, upload, true)
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

  return (
    <main>
      <div className="import-products">
        <div className="content">
          <Heading level="1" size="large" align="center">
            Importer produkter
          </Heading>
          {isLoading && <Loader size="2xlarge" />}

          {!isLoading && productsToValidate.length > 0 && (
            <>
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
                  onClick={(event) => {}}
                >
                  Importer
                </Button>
              </HStack>

              {productsToValidate.map((product) => {
                return (
                  <>
                    <ExpansionCard aria-label="Produktserie med varianter" style={{ width: "90vw" }} size="small">
                      <ExpansionCard.Header>
                        <ExpansionCard.Title>{product.title}</ExpansionCard.Title>
                        <ExpansionCard.Description>
                          <ProductSeriesInfo product={product} />
                        </ExpansionCard.Description>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <VariantsTable product={product} />
                      </ExpansionCard.Content>
                    </ExpansionCard>
                  </>
                );
              })}
            </>
          )}
          {error && (
            <p>
              <span className="auth-dialog-box__erorr-message">{error?.message}</span>
            </p>
          )}
        </div>
      </div>
    </main>
  );
};
