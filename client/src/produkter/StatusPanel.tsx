import { ProductRegistrationDTO } from "utils/types/response-types";
import { BodyLong, Box, Heading, VStack } from "@navikt/ds-react";
import StatusTag from "felleskomponenter/StatusTag";
import { toReadableDateTimeString } from "utils/date-util";

interface Props {
  product: ProductRegistrationDTO;
  isAdmin: boolean;
}

const StatusPanel = ({ product, isAdmin }: Props) => {

  const isDraft = product.draftStatus === "DRAFT";
  const isPending = product.adminStatus === "PENDING";
  const sendtTilGodkjenning = !isDraft && isPending;
  const publisert = !isDraft && product.adminStatus === "APPROVED";

  return (
    <VStack gap="4">
      <Heading level="1" size="medium">
        Status
      </Heading>

      <StatusTag isPending={isPending} isDraft={isDraft} />

      {!isAdmin && product.message && (
        <Box>
          <BodyLong size="small" weight="semibold">
            Melding til leverandør
          </BodyLong>
          <BodyLong size="small">{product.message}</BodyLong>
        </Box>
      )}

      {publisert && product.published && <StatusBox title="Publisert" date={product.published} />}

      {publisert && product.published && <StatusBox title="Endringer publisert" date={product.published} />}

      {sendtTilGodkjenning && <StatusBox title="Sendt til godkjenning" date={product.created} />}

      <StatusBox title="Endret" date={product.updated} />

      <Box>
        <BodyLong size="small" weight="semibold">
          Endret av
        </BodyLong>
        <BodyLong size="small">{product.updatedByUser}</BodyLong>
      </Box>

      <StatusBox title="Opprettet" date={product.created} />
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
