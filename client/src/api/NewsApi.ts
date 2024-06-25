import { NewsChunk } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import useSWR from "swr";
import {fetcherGET} from "utils/swr-hooks";

export function usePagedNews({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/news?page=${page}&size=${pageSize}`

  const { data, error, isLoading } = useSWR<NewsChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}