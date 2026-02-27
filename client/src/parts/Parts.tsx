import { BodyLong, Box, Button, Heading, Tabs, VStack } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PartsListTab from "parts/PartsListTab";
import SeriesListTab from "parts/SeriesListTab";
import { PlusIcon } from "@navikt/aksel-icons";
import { AlertWithCloseButton } from "felleskomponenter/AlertWithCloseButton";

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
      <VStack gap={{ xs: "space-8", md: "space-12" }} maxWidth={loggedInUser && loggedInUser.isAdminOrHmsUser ? "80rem" : "64rem"}>
        <AlertWithCloseButton variant={"warning"} alertId={"tilbReadyAlert"}>
          <Heading size={"small"}>Informasjon om deler</Heading>
          <BodyLong>
            Det er nå mulig å legge inn og redigere tilbehør og reservedeler. Vi oppfordrer dere til å legge inn bilder
            og beskrivelser av disse delene.
          </BodyLong>
        </AlertWithCloseButton>

        <Heading level="1" size="large" spacing>
          Deler
        </Heading>
        {loggedInUser && (
          <Box>
            <Button
              variant="secondary"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={() => navigate("/del/opprett")}
              style={{ maxHeight: "3rem" }}
            >
              Opprett ny del
            </Button>
          </Box>
        )}
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
