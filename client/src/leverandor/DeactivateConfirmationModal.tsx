import { SupplierRegistrationDTO } from "utils/types/response-types";
import { Button, Modal } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { deactivateSupplier } from "api/SupplierApi";
import { Supplier } from "utils/supplier-util";

export const DeactivateConfirmationModal = ({
  supplier,
  mutateSupplier,
  isOpen,
  setIsOpen,
}: {
  supplier: Supplier;
  mutateSupplier: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onDelete() {
    deactivateSupplier(loggedInUser?.isAdmin ?? true, supplier.id)
      .then(() => mutateSupplier())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <Modal
      open={isOpen}
      header={{ heading: "Er du sikker på at du vil deaktivere leverandøren?" }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Footer>
        <Button
          onClick={() => {
            onDelete().then(() => setIsOpen(false));
          }}
        >
          Deaktiver
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
