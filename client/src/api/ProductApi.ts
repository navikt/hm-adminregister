import { DraftVariantDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI, getPath } from "api/fetch";

export const getProductByHmsNr = (hmsArtNr: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, "GET");

export const updateProductVariant = async (
  isAdmin: boolean,
  updatedProduct: ProductRegistrationDTO,
): Promise<ProductRegistrationDTO> =>
  fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/${updatedProduct.id}`), "PUT", updatedProduct);

export const draftProductVariantV2 = async (
  isAdmin: boolean,
  seriesUUID: string,
  newVariant: DraftVariantDTO,
): Promise<ProductRegistrationDTO> => {
  return await fetchAPI(
    getPath(isAdmin, `/api/v1/product/registrations/draftWithV2/${seriesUUID}`),
    "POST",
    newVariant,
  );
};

export const sendFlereTilGodkjenning = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(false, `/api/v1/product/registrations/til-godkjenning`), "PUT", productIds);
};

export const rejectProducts = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(true, `/api/v1/product/registrations/reject`), "PUT", productIds);
};

export const publishProducts = async (productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(true, `/api/v1/product/registrations/approve`), "PUT", productIds);
};

export const deleteProducts = async (isAdmin: boolean, productIds: string[]): Promise<ProductRegistrationDTO[]> => {
  return await fetchAPI(getPath(isAdmin, `/api/v1/product/registrations/delete`), "DELETE", productIds);
};
