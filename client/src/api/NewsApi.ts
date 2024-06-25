import { NewsChunk } from "utils/types/response-types";
import { HM_REGISTER_URL } from "environments";
import { fetchAPI, getPath } from "api/fetch";

export function usePagedNews({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/news/`

  const { data, error, isLoading } = useSWR<NewsChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}