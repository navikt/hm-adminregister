import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";

export function getFeatureFlag(feature: string) {
  const path = `/adminregister/features?feature=${feature}`;
  const { data, error, isLoading } = useSWR<Features>(path, fetcherGET);

  const flagEnabled = !!(data && data[feature]);
  return {
    flagEnabled,
    isLoading,
    error,
  };
}

type Features = { [key: string]: boolean };
