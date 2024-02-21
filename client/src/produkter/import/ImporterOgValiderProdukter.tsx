import { useState } from "react";
import ImporterProdukter, { Upload } from "produkter/import/ImporterProdukter";
import { ValiderImporterteProdukter } from "produkter/import/ValiderImporterteProdukter";

export const ImporterOgValiderProdukter = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <ImporterProdukter validerImporterteProdukter={setUpload} />;
  } else return <ValiderImporterteProdukter upload={upload} />;
};
