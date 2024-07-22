import { SeriesRegistrationDTO } from "utils/types/response-types";
import { BodyLong, Box, Heading, VStack } from "@navikt/ds-react";
import SeriesStatusTag from "products/SeriesStatusTag";
import { toReadableDateTimeString } from "utils/date-util";
import { seriesStatus } from "products/seriesUtils";
import { useSupplier } from "utils/swr-hooks";
import { useAuthStore } from "utils/store/useAuthStore";

interface Props {
  series: SeriesRegistrationDTO;
}

const StatusPanel = ({ series }: Props) => {
  const { loggedInUser } = useAuthStore();
  const { supplier } = useSupplier(loggedInUser?.isAdmin, series?.supplierId);

  return (
    <VStack gap="4">
      <Heading level="1" size="medium">
        Status
      </Heading>

      <SeriesStatusTag seriesStatus={seriesStatus(series)} />

      <Box>
        <BodyLong size="small" weight="semibold">
          Leverandør
        </BodyLong>
        <BodyLong size="small">{supplier?.name}</BodyLong>
      </Box>

      {series.message && (
        <Box>
          <BodyLong size="small" weight="semibold">
            Melding til leverandør
          </BodyLong>
          <BodyLong size="small">{series.message}</BodyLong>
        </Box>
      )}

      {series.published && <StatusBox title="Publisert" date={series.published} />}

      <StatusBox title="Endret" date={series.updated} />

      <Box>
        <BodyLong size="small" weight="semibold">
          Endret av
        </BodyLong>
        <BodyLong size="small">{series.updatedByUser}</BodyLong>
      </Box>

      <StatusBox title="Opprettet" date={series.created} />
    </VStack>
  );
};

const StatusBox = ({ title, date }: { title: string; date: string }) => {
  return (
    <Box>
      <BodyLong size="small" weight="semibold">
        {title}
      </BodyLong>
      <BodyLong size="small">{toReadableDateTimeString(date)}</BodyLong>
    </Box>
  );
};
export default StatusPanel;
