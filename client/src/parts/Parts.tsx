import { Heading, Tabs, VStack } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PartsListTab from "parts/PartsListTab";
import SeriesListTab from "parts/SeriesListTab";

const Parts = () => {
  const { loggedInUser } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "deler";

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`);
  };

  return (
    <main className="show-menu">
      <VStack gap={{ xs: "8", md: "12" }} maxWidth={loggedInUser && loggedInUser.isAdmin ? "80rem" : "64rem"}>
        <Heading level="1" size="large" spacing>
          Deler
        </Heading>
        <Tabs defaultValue={activeTab || "about"} onChange={updateUrlOnTabChange}>
          <Tabs.List>
            <Tabs.Tab value="deler" label="Søk på del" />
            <Tabs.Tab value="serier" label="Deler på serie" />
          </Tabs.List>
          <PartsListTab />
          <SeriesListTab />
        </Tabs>
      </VStack>
    </main>
  );
};

export default Parts;
