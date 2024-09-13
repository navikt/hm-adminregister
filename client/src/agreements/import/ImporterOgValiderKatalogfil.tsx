import { useState } from "react";
import "./import.scss";
import { ValidateImportedProductAgreements } from "agreements/import/valideringsside/ValidateImportedProductAgreements";
import FellesImport, { Upload } from "felleskomponenter/FellesImport";

export const ImporterOgValiderKatalogfil = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);

  if (!upload) {
    return <FellesImport validerImporterteProdukter={setUpload} tekst="Importer katalogfil" />;
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
