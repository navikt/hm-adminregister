import { useState } from "react";
import "./import.scss";
import { ValiderImporterteProdukter } from "produkter/import/valideringsside/ValiderImporterteProdukter";
import ImporterProdukter, { Upload } from "produkter/import/ImporterProdukter";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <ImporterProdukter validerImporterteProdukter={setUpload} />;
  } else return <ValiderImporterteProdukter upload={upload} />;
};
