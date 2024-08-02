import { ProductRegistrationDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { markProductsAsDeleted } from "api/ProductApi";
import { Button, Modal } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { deleteSeries } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";

export const DeleteConfirmationModal = ({
  series,
  products,
  mutateProducts,
  mutateSeries,
  isOpen,
  setIsOpen,
}: {
  series: SeriesRegistrationDTO;
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onDelete() {
    deleteSeries(loggedInUser?.isAdmin ?? true, series.id)
      .then(() => {
        mutateSeries();
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
