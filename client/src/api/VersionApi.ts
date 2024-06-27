import { fetchAPI, getPath } from "api/fetch";
import { DifferenceDTO, ProductRegistrationDTO } from "utils/types/response-types";

export const getDifferenceFromPublishedSeries = async (seriesUUID: string, version: number): Promise<DifferenceDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/versions/${seriesUUID}/compare/${version}/approved`), "GET");
};

const getDifferenceFromPublishedVariant = async (productId: string, version: number): Promise<DifferenceDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/product/versions/${productId}/compare/${version}/approved`), "GET");
};

export const getDifferencesFromPublishedVariants = async (
  products: ProductRegistrationDTO[],
): Promise<ProductDifferenceDTO[]> => {
  return await Promise.all(
    products.map(async (product) => {
      const difference = await getDifferenceFromPublishedVariant(product.id, product.version ?? 0);
      return {
        product: product,
        difference: difference,
      };
    }),
  );
};

export type ProductDifferenceDTO = {
  product: ProductRegistrationDTO;
  difference: DifferenceDTO;
};
