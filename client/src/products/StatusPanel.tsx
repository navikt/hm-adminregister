import { Heading, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import SeriesStatusTag from "products/SeriesStatusTag";
import { seriesStatusV2 } from "products/seriesUtils";
import { toReadableDateTimeString } from "utils/date-util";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";

const StatusPanel = ({ series }: { series: SeriesRegistrationDTOV2 }) => {
  return (
    <VStack gap={{ xs: "6", md: "10" }}>
      <VStack gap="3">
        <Heading level="1" size="medium">
          Status
        </Heading>
        <SeriesStatusTag seriesStatus={seriesStatusV2(series)} />
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
