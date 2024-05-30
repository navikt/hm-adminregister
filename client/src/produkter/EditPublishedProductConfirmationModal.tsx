import { SeriesRegistrationDTO } from "utils/types/response-types";
import { Button, Modal } from "@navikt/ds-react";
import { setPublishedSeriesToDraft } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";

export const EditPublishedProductConfirmationModal = ({
  series,
  mutateProducts,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  mutateProducts: () => void;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();

  async function onClick() {
    setPublishedSeriesToDraft(series.id)
      .then(() => {
        mutateSeries();
        mutateProducts();
      })
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <Modal
      open={isOpen}
      header={{ heading: "Vil du sette produktet i redigeringsmodus?" }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Footer>
        <Button
          onClick={() => {
            onClick().then(() => setIsOpen(false));
          }}
        >
          OK
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
