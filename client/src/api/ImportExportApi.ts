import { ProductAgreementImportDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { fetchAPIWithHeaders, fetchAPIWithHeadersAndArrayBufferResponse, getPath } from "api/fetch";
import { Upload } from "felleskomponenter/FellesImport";

export const exportProducts = async (isAdmin: boolean, seriesId: string): Promise<any> => {
  return await fetchAPIWithHeadersAndArrayBufferResponse(
    getPath(isAdmin, `/api/v1/product/registrations/excel/export/supplier/${seriesId}`),
    "POST",
    undefined,
    {
      accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  );
};

export const importProducts = async (
  isAdmin: boolean,
  seriesId: string,
  upload: Upload,
  dryRun: boolean,
): Promise<ProductRegistrationDTO[]> => {
  const formData = new FormData();
  formData.append("file", upload.file);

  return await fetchAPIWithHeaders(
    getPath(
      isAdmin,
      dryRun
        ? `/api/v1/product/registrations/excel/import-dryrun/${seriesId}`
        : `/api/v1/product/registrations/excel/import/${seriesId}`,
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
