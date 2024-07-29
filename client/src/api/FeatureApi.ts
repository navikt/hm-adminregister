import { FeatureFlag } from "utils/types/response-types";
import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";

export function getFeatureFlag(feature: string) {
  const path = `/features?feature=${feature}`;
  const { data, error, isLoading } = useSWR<FeatureFlag>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}
