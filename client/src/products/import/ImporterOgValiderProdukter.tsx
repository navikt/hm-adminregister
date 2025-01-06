import React, { useState } from "react";
import "./import.scss";
import { ValidateImportedProducts } from "products/import/valideringsside/ValidateImportedProducts";
import { useParams } from "react-router-dom";
import { Loader } from "@navikt/ds-react";
import FellesImport, { Upload } from "felleskomponenter/FellesImport";
import { useSeriesV2 } from "api/SeriesApi";
import ErrorAlert from "error/ErrorAlert";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const { seriesId } = useParams();

  const { data: series, isLoading, error } = useSeriesV2(seriesId!);

  if (isLoading) {
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

  if (!series || error) {
    return (
      <main className="show-menu">
        <ErrorAlert />
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
        seriesTitle={series.title}
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
