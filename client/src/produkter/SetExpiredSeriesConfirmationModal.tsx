import { Alert, Button, Modal } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTO } from "utils/types/response-types";

export const SetExpiredSeriesConfirmationModal = ({
  series,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onSetExpired() {
    console.log("Ikke implementert");
  }

  return (
    <Modal
      open={isOpen}
      header={{
        heading: `Er du sikker på at du vil sette produktet og alle variantene som utgått?`,
      }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Body>
        <Alert variant="warning">
          Det er ikke mulig å angre dette, da må man manuelt sette hver enkelt variant det gjelder som ikke utgått.{" "}
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            onSetExpired().then(() => setIsOpen(false));
          }}
        >
          Sett som utgått
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
