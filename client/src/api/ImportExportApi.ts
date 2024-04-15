import { ProductAgreementImportDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { Upload } from "produkter/import/ImporterProdukter";
import { fetchAPIWithHeaders, fetchAPIWithHeadersAndArrayBufferResponse, getPath } from "api/fetch";

export const exportProducts = async (isAdmin: boolean): Promise<any> => {
  return await fetchAPIWithHeadersAndArrayBufferResponse(
    getPath(isAdmin, "/api/v1/product/registrations/excel/export/supplier"),
    "POST",
    undefined,
    {
      accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  );
};

export const importProducts = async (
  isAdmin: boolean,
  upload: Upload,
  dryRun: boolean,
): Promise<ProductRegistrationDTO[]> => {
  const formData = new FormData();
  formData.append("file", upload.file);

  return await fetchAPIWithHeaders(
    getPath(
      isAdmin,
      dryRun ? "/api/v1/product/registrations/excel/import-dryrun" : "/api/v1/product/registrations/excel/import",
    ),
    "POST",
    formData,
    {
      accept: "application/json",
    },
  );
};

export const importKatalogfil = async (upload: Upload, dryRun: boolean): Promise<ProductAgreementImportDTO> => {
  const formData = new FormData();
  formData.append("file", upload.file);

  return await fetchAPIWithHeaders(
    getPath(
      true,
      dryRun
        ? "/api/v1/product-agreement/excel-import?dryRun=true"
        : "/api/v1/product-agreement/excel-import?dryRun=false",
    ),
    "POST",
    formData,
    {
      accept: "application/json",
    },
  );
};
