import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { IToggle } from "toggles/context";
import { EXPECTED_TOGGLES } from "toggles/toggles";

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

export function getFeatureFlags() {
  const queryParams = EXPECTED_TOGGLES.map((toggle) => `feature=${toggle}`).join("&");
  const path = `/adminregister/features?${queryParams}`;
  const { data, error, isLoading } = useSWR<[IToggle]>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

type Features = { [key: string]: boolean };
