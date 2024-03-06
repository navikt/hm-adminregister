import { useState } from "react";
import "./import.scss";
import ImporterKatalogfil, { Upload } from "rammeavtaler/import/ImporterKatalogfil";
import { ValiderImporterteProductAgreements } from "rammeavtaler/import/valideringsside/ValiderImporterteProductAgreements";

export const ImporterOgValiderKatalogfil = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <ImporterKatalogfil validerImporterteProdukter={setUpload} />;
  } else
    return (
      <ValiderImporterteProductAgreements
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
