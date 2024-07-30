import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { IToggle } from "toggles/context";
import { EXPECTED_TOGGLES } from "toggles/toggles";

export function getFeatureFlags() {
  const queryParams = EXPECTED_TOGGLES.map((toggle) => `feature=${toggle}`).join("&");
  const path = `/adminregister/features?${queryParams}`;
  const { data: flags, error, isLoading } = useSWR<IToggle[]>(path, fetcherGET);

  return {
    flags,
    isLoading,
    error,
  };
}
