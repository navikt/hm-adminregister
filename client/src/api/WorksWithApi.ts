import { WorksWithMapping, WorksWithMappingList } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI } from "api/fetch";

const updatePartCompatability = async (productId: string, worksWithMappingList: WorksWithMappingList): Promise<void> =>
  fetchAPI(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/works-with/batch`, "POST", worksWithMappingList);

export const removeWorksWithVariant = async (worksWithMapping: WorksWithMapping): Promise<void> => {
  return await fetchAPI(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/works-with`, "DELETE", worksWithMapping);
};

export const addWorksWithVariantList = async (
  productId: string,
  productIdToAdd: string[],
  isAdmin: boolean,
): Promise<void> => {
  const worksWithMappingList: WorksWithMappingList = productIdToAdd.map((targetProductId) => ({
    sourceProductId: productId,
    targetProductId,
  }));

  return await updatePartCompatability(productId, worksWithMappingList);
};
