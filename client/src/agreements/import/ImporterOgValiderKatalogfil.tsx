import { useState } from "react";
import "./import.scss";
import ImporterKatalogfil, { Upload } from "agreements/import/ImporterKatalogfil";
import { ValidateImportedProductAgreements } from "agreements/import/valideringsside/ValidateImportedProductAgreements";

export const ImporterOgValiderKatalogfil = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <ImporterKatalogfil validerImporterteProdukter={setUpload} />;
  } else
    return (
      <ValidateImportedProductAgreements
        upload={upload}
        reseetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
