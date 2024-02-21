import { ExpansionCard, Loader } from "@navikt/ds-react";
import { Upload } from "produkter/import/ImporterProdukter";
import React, { useEffect, useState } from "react";
import { importProducts } from "api/ImportApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { Product } from "utils/types/types";
import { mapProductRegistrationDTOToProduct } from "utils/product-util";
import { ProductSeriesInfo } from "produkter/import/ProductSeriesInfo";
import { VariantsTable } from "produkter/import/VariantsTable";

interface Props {
  upload: Upload;
}

export const ValiderImporterteProdukter = ({ upload }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [productsToValidate, setProductsToValidate] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      <div className="create-new-product">
        <div className="content">
          {isLoading && <Loader size="2xlarge" />}

          {!isLoading && productsToValidate.length > 0 && (
            <>
              <p></p>
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
