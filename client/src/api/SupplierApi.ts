import { fetchAPI, getPath } from "api/fetch";
import { SupplierDTOBody } from "utils/supplier-util";
import { SupplierRegistrationDTO } from "utils/types/response-types";

export const getSupplier = async (isAdmin: boolean, supplierId: string): Promise<SupplierRegistrationDTO> => {
  const endOfPath = isAdmin ? `/api/v1/supplier/registrations/${supplierId}` : "/api/v1/supplier/registrations";

  return fetchAPI(getPath(isAdmin, endOfPath), "GET");
};

export const updateSupplier = async (
  isAdmin: boolean,
  supplierId: string,
  supplierDTOBody: SupplierDTOBody,
): Promise<SupplierRegistrationDTO> => {
  const supplierToUpdate = await getSupplier(isAdmin, supplierId);
  const updatedSupplier = { ...supplierToUpdate, ...supplierDTOBody };

  const endOfPath = isAdmin ? `/api/v1/supplier/registrations/${supplierId}` : "/api/v1/supplier/registrations";

  return fetchAPI(getPath(isAdmin, endOfPath), "PUT", updatedSupplier);
};

export const createNewSupplier = async (
  isAdmin: boolean,
  newSupplier: SupplierDTOBody,
): Promise<SupplierRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations)`), "POST", newSupplier);

export const deactivateSupplier = async (isAdmin: boolean, supplierId: string): Promise<SupplierRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/supplier/registrations/${supplierId}`), "DELETE");
