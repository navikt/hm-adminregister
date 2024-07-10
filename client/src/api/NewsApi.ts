import { NewsChunk, NewsRegistrationDTO } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { fetchAPI, getPath } from "api/fetch";

export function getPageNews() {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/news?&sort=published,DESC&status=ACTIVE,INACTIVE`;
  const { data, error, isLoading, mutate } = useSWR<NewsChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export const createNews = async (newNewsRelease: NewsRegistrationDTO): Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/`), "POST", newNewsRelease);
};

export const updateNews = async (updatedNewsRelease: NewsRegistrationDTO): Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/${updatedNewsRelease.id}`), "PUT", updatedNewsRelease);
};

export const publishNews = async (newsReleaseId: string): Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/publish/${newsReleaseId}`), "PUT");
};

export const unpublishNews = async (newsReleaseId: string): Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/unpublish/${newsReleaseId}`), "PUT");
};

export const deleteNews = async (newsReleaseId: string): Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/${newsReleaseId}`), "DELETE");
};
