import { useState } from "react";
import ImporterProdukter, { Upload } from "produkter/import/components/ImporterProdukter";
import { ValiderImporterteProdukter } from "produkter/import/components/ValiderImporterteProdukter";
import "./import.scss";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <ImporterProdukter validerImporterteProdukter={setUpload} />;
  } else return <ValiderImporterteProdukter upload={upload} />;
};
