import { SeriesDTO } from "utils/types/response-types";
import { Box, Button, Modal, Textarea } from "@navikt/ds-react";
import { rejectSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { useState } from "react";

export const RejectApprovalModal = ({
  series,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesDTO;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();

  const [message, setMessage] = useState<string | null>(series.message ?? null);

  async function onRejectApproval(message: string | null) {
    rejectSeries(series.id, { message: message })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error.status, error.message);
      });
  }

  return (
    <Modal open={isOpen} header={{ heading: "Avslå produkt" }} onClose={() => setIsOpen(false)}>
      <Box padding="4">
        <Textarea
          label="Melding til leverandør"
          description="Unngå personopplysninger i meldingen"
          value={message || ""}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Box>
      <Modal.Footer>
        <Button
          onClick={() => {
            onRejectApproval(message).then(() => setIsOpen(false));
          }}
        >
          Avslå
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
