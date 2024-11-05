import {
  DraftVariantDTO,
  ProductRegistrationDTO,
  ProductRegistrationDTOV2,
  UpdateProductRegistrationDTO,
} from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI, fetchAPIModify, getPath, httpDelete } from "api/fetch";

export const getProductByHmsNr = (hmsArtNr: string): Promise<ProductRegistrationDTO> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/hmsArtNr/${hmsArtNr}`, "GET");

export const updateProductVariant = async (
  isAdmin: boolean,
  id: string,
  updatedProduct: UpdateProductRegistrationDTO,
): Promise<ProductRegistrationDTOV2> =>
  fetchAPI(getPath(isAdmin, `/api/v2/product/registrations/${id}`), "PUT", updatedProduct);

export const draftProductVariantV2 = async (
  isAdmin: boolean,
  seriesUUID: string,
  newVariant: DraftVariantDTO,
): Promise<ProductRegistrationDTOV2> => {
  return await fetchAPI(
    getPath(isAdmin, `/api/v2/product/registrations/draftWithV3/${seriesUUID}`),
    "POST",
    newVariant,
  );
};

export const deleteDraftProducts = async (isAdmin: boolean, productIds: string[]): Promise<any> => {
  return await httpDelete(getPath(isAdmin, `/api/v2/product/registrations/draft/delete`), "DELETE", productIds);
};

export const setVariantToExpired = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v2/product/registrations/to-expired/${id}`), "PUT");
};

export const setVariantToActive = async (id: string, isAdmin: boolean): Promise<any> => {
  return await fetchAPIModify(getPath(isAdmin, `/api/v2/product/registrations/to-active/${id}`), "PUT");
};
