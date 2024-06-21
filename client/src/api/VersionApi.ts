import { fetchAPI, getPath } from "api/fetch";
import { DifferenceDTO } from "utils/types/response-types";

export const getDifferenceFromPublishedSeries = async (seriesUUID: string, version: number): Promise<DifferenceDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/series/versions/${seriesUUID}/compare/${version}/approved`), "GET");
};

export const getDifferenceFromPublishedVariant = async (productId: string, version: number): Promise<DifferenceDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/product/versions/${productId}/compare/${version}/approved`), "GET");
};
