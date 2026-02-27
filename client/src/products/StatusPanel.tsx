import { Heading, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import SeriesStatusTag from "products/SeriesStatusTag";
import { seriesStatus } from "products/seriesUtils";
import { toReadableDateTimeString } from "utils/date-util";
import { SeriesDTO } from "utils/types/response-types";

const StatusPanel = ({ series }: { series: SeriesDTO }) => {
  return (
    <VStack gap={{ xs: "space-6", md: "space-12" }}>
      <VStack gap="space-4">
        <Heading level="1" size="medium">
          Status
        </Heading>
        <SeriesStatusTag seriesStatus={seriesStatus(series.status, series.isPublished)} />
      </VStack>

      <DefinitionList>
        <DefinitionList.Term>Leverandør</DefinitionList.Term>
        <DefinitionList.Definition>{series.supplierName}</DefinitionList.Definition>

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
