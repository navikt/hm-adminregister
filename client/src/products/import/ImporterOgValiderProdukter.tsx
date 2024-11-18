import React, { useState } from "react";
import "./import.scss";
import { ValidateImportedProducts } from "products/import/valideringsside/ValidateImportedProducts";
import { useParams } from "react-router-dom";
import { useSeries } from "utils/swr-hooks";
import { Loader } from "@navikt/ds-react";
import FellesImport, { Upload } from "felleskomponenter/FellesImport";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const { seriesId } = useParams();

  const { series, isLoadingSeries } = useSeries(seriesId!);

  if (isLoadingSeries) {
    return (
      <main>
        <div className="import-products">
          <div className="content">
            <Loader size="2xlarge" title="venter..." />
          </div>
        </div>
      </main>
    );
  }

  if (!upload) {
    return (
      <FellesImport
        validerImporterteProdukter={setUpload}
        tekst={`Importer varianter for ${series?.title}`}
        setSupplier_={() => {}}
      />
    );
  } else
    return (
      <ValidateImportedProducts
        seriesId={seriesId!}
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
