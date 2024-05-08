import { SeriesRegistrationDTO } from "utils/types/response-types";
import { BodyLong, Box, Heading, VStack } from "@navikt/ds-react";
import StatusTag from "felleskomponenter/StatusTag";
import { toReadableDateTimeString } from "utils/date-util";

interface Props {
  series: SeriesRegistrationDTO;
  isAdmin: boolean;
}

const StatusPanel = ({ series, isAdmin }: Props) => {
  const isDraft = series.draftStatus === "DRAFT";
  const isPending = series.adminStatus === "PENDING";
  const isRejected = series.adminStatus === "REJECTED";
  const isDeleted = series.status === "DELETED";
  const isInactive = series.status === "INACTIVE";
  const publisert = !isDraft && series.adminStatus === "APPROVED";

  return (
    <VStack gap="4">
      <Heading level="1" size="medium">
        Status
      </Heading>

      <StatusTag
        isPending={isPending}
        isDraft={isDraft}
        isDeleted={isDeleted}
        isInactive={isInactive}
        isRejected={isRejected}
      />

      {/*todo: punlushed missing on series*/}
      {/*{publisert && series.published && <StatusBox title="Publisert" date={series.published} />}*/}

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
