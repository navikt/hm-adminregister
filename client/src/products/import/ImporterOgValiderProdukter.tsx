import { useState } from "react";
import "./import.scss";
import { ValidateImportedProducts } from "products/import/valideringsside/ValidateImportedProducts";
import ImporterProdukter, { Upload } from "products/import/ImporterProdukter";
import { useParams } from "react-router-dom";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const { seriesId } = useParams();

  if (!upload) {
    return <ImporterProdukter seriesId={seriesId!} validerImporterteProdukter={setUpload} />;
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
