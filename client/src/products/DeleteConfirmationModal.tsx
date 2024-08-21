import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import { Button, Modal } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { deleteSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import { useNavigate } from "react-router-dom";

export const DeleteConfirmationModal = ({
  series,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTOV2;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const navigate = useNavigate();

  async function onDelete() {
    deleteSeries(loggedInUser?.isAdmin ?? true, series.id)
      .then(() => {
        mutateSeries();
        navigate("/produkter");
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <Modal
      open={isOpen}
      header={{ heading: "Er du sikker på at du vil slette produktet?" }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Footer>
        <Button
          onClick={() => {
            onDelete().then(() => setIsOpen(false));
          }}
        >
          Slett
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
