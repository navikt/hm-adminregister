import { Heading, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import { toReadableDateTimeString } from "utils/date-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { useSupplier } from "utils/swr-hooks";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import SeriesStatusTag from "./SeriesStatusTag";
import { seriesStatus } from "./seriesUtils";

interface Props {
  series: SeriesRegistrationDTO;
}

const StatusPanel = ({ series }: Props) => {
  const { loggedInUser } = useAuthStore();
  const { supplier } = useSupplier(loggedInUser?.isAdmin, series?.supplierId);

  return (
    <VStack gap={{ xs: "6", md: "10" }}>
      <VStack gap="3">
        <Heading level="1" size="medium">
          Status
        </Heading>

        <SeriesStatusTag seriesStatus={seriesStatus(series)} />
      </VStack>

      <DefinitionList>
        <DefinitionList.Term>Leverandør</DefinitionList.Term>
        <DefinitionList.Definition>{supplier?.name}</DefinitionList.Definition>

        {series.message && (
          <>
            <DefinitionList.Term>Melding til leverandør</DefinitionList.Term>
            <DefinitionList.Definition>{series.message}</DefinitionList.Definition>
          </>
        )}
        {series.published && (
          <>
            <DefinitionList.Term>Publisert</DefinitionList.Term>
            <DefinitionList.Definition>{toReadableDateTimeString(series.published)}</DefinitionList.Definition>
          </>
        )}

        <DefinitionList.Term>Endret</DefinitionList.Term>
        <DefinitionList.Definition>{toReadableDateTimeString(series.updated)}</DefinitionList.Definition>
        <DefinitionList.Term>Endret av</DefinitionList.Term>
        <DefinitionList.Definition>{series.updatedByUser}</DefinitionList.Definition>
        <DefinitionList.Term>Opprettet</DefinitionList.Term>
        <DefinitionList.Definition>{toReadableDateTimeString(series.created)}</DefinitionList.Definition>
      </DefinitionList>
    </VStack>
  );
};

export default StatusPanel;
