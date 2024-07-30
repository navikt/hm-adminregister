import useSWR from "swr";
import { fetcherGET } from "utils/swr-hooks";
import { IToggle } from "toggles/context";
import { EXPECTED_TOGGLES } from "toggles/toggles";

export function getFeatureFlags() {
  const queryParams = EXPECTED_TOGGLES.map((toggle) => `feature=${toggle}`).join("&");
  const path = `/adminregister/features?${queryParams}`;

  const { data, error } = useSWR<Record<string, boolean>>(path, fetcherGET);

  if (error) {
    console.error("Error fetching feature flags", error);
    return [];
  }

  const toggles: IToggle[] = EXPECTED_TOGGLES.map((toggle) => ({
    name: toggle,
    enabled: data ? data[toggle] : false,
  }));

  return toggles;
}
