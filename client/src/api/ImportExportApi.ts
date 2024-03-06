import { ProductAgreementImportDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { Upload } from "produkter/import/ImporterProdukter";

const productImportPathDryrun = (isAdmin: boolean): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/excel/import-dryrun`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/excel/import-dryrun`;

const productImportPath = (isAdmin: boolean): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/excel/import`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/excel/import`;

const katalogImportPath = (dryRun: boolean): string =>
  dryRun
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/excel-import?dryRun=true`
    : `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/excel-import?dryRun=false`;

const productExportForSupplierPath = (isAdmin: boolean): string =>
  isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/excel/export/supplier`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/excel/export/supplier`;

export const exportProducts = async (isAdmin: boolean): Promise<any> => {
  const response = await fetch(productExportForSupplierPath(isAdmin), {
    method: "POST",
    headers: {
      accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    credentials: "include",
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const importProducts = async (
  isAdmin: boolean,
  upload: Upload,
  dryRun: boolean,
): Promise<ProductRegistrationDTO[]> => {
  const formData = new FormData();
  formData.append("file", upload.file);

  const response = await fetch(dryRun ? productImportPathDryrun(isAdmin) : productImportPath(isAdmin), {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    credentials: "include",
    body: formData,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};

export const importKatalogfil = async (upload: Upload, dryRun: boolean): Promise<ProductAgreementImportDTO> => {
  const formData = new FormData();
  formData.append("file", upload.file);

  console.log("Importerer katalogfil");

  const response = await fetch(dryRun ? katalogImportPath(dryRun) : katalogImportPath(dryRun), {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    credentials: "include",
    body: formData,
  });

  if (response.ok) {
    console.log("mottok response i fetch");
    return await response.json();
  } else {
    const error = await response.json();
    return Promise.reject(error);
  }
};
