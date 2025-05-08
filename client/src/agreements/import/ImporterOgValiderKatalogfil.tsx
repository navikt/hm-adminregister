import { useState } from "react";
import "./import.scss";
import { ValidateImportedProductAgreements } from "agreements/import/valideringsside/ValidateImportedProductAgreements";
import FellesImport, { Upload } from "felleskomponenter/FellesImport";

export const ImporterOgValiderKatalogfil = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const [supplier, setSupplier] = useState<string | undefined>(undefined);

  if (!upload || !supplier) {
    return (
      <FellesImport validerImporterteProdukter={setUpload} setSupplier_={setSupplier} tekst="Importer katalogfil" />
    );
  } else
    return (
      <ValidateImportedProductAgreements
        supplier={supplier}
        upload={upload}
        resetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
