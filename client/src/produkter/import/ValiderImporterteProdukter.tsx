import { Loader } from "@navikt/ds-react";
import { Upload } from "produkter/import/ImporterProdukter";
import React, { useEffect, useState } from "react";
import { importProducts } from "api/ImportApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { ProductRegistrationDTO } from "utils/types/response-types";
import * as _ from "lodash";

interface Props {
  upload: Upload;
}

export const ValiderImporterteProdukter = ({ upload }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [productsToValidate, setProductsToValidate] = useState<ProductRegistrationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importerDryrun();
  }, []);

  const importerDryrun = () => {
    setIsLoading(true);
    importProducts(loggedInUser?.isAdmin || false, upload, true)
      .then((response) => {
        setProductsToValidate(response);

        const groupedBySeries = _.groupBy(response, "seriesUUID");
        Object.entries(groupedBySeries).forEach(([key, value]) => console.log(key, value));

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

          {!isLoading &&
            productsToValidate.length > 0 &&
            productsToValidate.map((product) => (
              <div key={product.id}>
                <h2>{product.title}</h2>
              </div>
            ))}

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
