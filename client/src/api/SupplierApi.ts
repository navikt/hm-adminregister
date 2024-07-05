import { SupplierRegistrationDTO } from "utils/types/response-types";
import { fetchAPI, getPath } from "api/fetch";
import { SupplierDTOBody } from "utils/supplier-util";

export const getSupplier = async (isAdmin: boolean, supplierId: string): Promise<SupplierRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations/${supplierId}`), "GET");

export const updateSupplier = async (
  isAdmin: boolean,
  supplierId: string,
  supplierDTOBody: SupplierDTOBody,
): Promise<SupplierRegistrationDTO> => {
  const supplierToUpdate = await getSupplier(isAdmin, supplierId);
  const updatedSupplier = { ...supplierToUpdate, ...supplierDTOBody };
  return fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations/${supplierId}`), "PUT", updatedSupplier);
};

export const createNewSupplier = async (
  isAdmin: boolean,
  newSupplier: SupplierDTOBody,
): Promise<SupplierRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations)`), "POST", newSupplier);

export const deactivateSupplier = async (isAdmin: boolean, supplierId: string): Promise<SupplierRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations/${supplierId}`), "DELETE");
