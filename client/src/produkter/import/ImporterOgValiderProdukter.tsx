import { useState } from "react";
import "./import.scss";
import { ValiderImporterteProdukter } from "produkter/import/valideringsside/ValiderImporterteProdukter";
import ImporterProdukter, { Upload } from "produkter/import/ImporterProdukter";
import { useParams } from "react-router-dom";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const { seriesId } = useParams();

  if (!upload) {
    return <ImporterProdukter seriesId={seriesId!} validerImporterteProdukter={setUpload} />;
  } else
    return (
      <ValiderImporterteProdukter
        seriesId={seriesId!}
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
