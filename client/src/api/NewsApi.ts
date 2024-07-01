import {NewsChunk, NewsRegistrationDTO} from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import {fetcherGET} from "utils/swr-hooks";
import {fetchAPI, getPath} from "api/fetch";

export function usePagedNews({page, pageSize}: {page: number; pageSize: number;}){
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/news?page=${page}&size=${pageSize}`
  const { data, error, isLoading } = useSWR<NewsChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

export function useFiltedNews({page, pageSize, includeInactive}: {page: number; pageSize: number; includeInactive: boolean}){

  const status = (includeInactive) ? "" : "&status=ACTIVE";
  console.log("include fra func",includeInactive)
  console.log("func state",status)
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/news?page=${page}&size=${pageSize}${status}`
  const { data, error, isLoading } = useSWR<NewsChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}


export const createNews = async (newNews: NewsRegistrationDTO ) : Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/`), "POST", newNews);

}

export const updateNews = async (newNews: NewsRegistrationDTO ) : Promise<NewsRegistrationDTO> => {
  return await fetchAPI(getPath(true, `/api/v1/news/${newNews.id}`), "PUT", newNews);
}
