import { useState } from "react";
import "./import.scss";
import { ValidateImportedCatalogImports } from "catalog/import/valideringsside/ValidateImportedCatalogImports";
import FellesImport, { Upload } from "felleskomponenter/FellesImport";

export const ImportAndValidate = () => {
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const [supplier, setSupplier] = useState<string | undefined>(undefined);

  if (!upload || !supplier) {
    return (
      <FellesImport validerImporterteProdukter={setUpload} setSupplier_={setSupplier} tekst="Importer katalogfil" />
    );
  } else
    return (
      <ValidateImportedCatalogImports
        supplier={supplier}
        upload={upload}
        resetUpload={() => {
          setUpload(undefined);
        }}
      />
    );
};
