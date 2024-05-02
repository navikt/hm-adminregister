import { ProductRegistrationDTO } from "utils/types/response-types";
import { deleteProducts } from "api/ProductApi";
import { Button, Modal } from "@navikt/ds-react";
import { useAuthStore } from "utils/store/useAuthStore";

export const DeleteConfirmationModal = ({
  products,
  mutateProducts,
  isOpen,
  setIsOpen,
}: {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  async function onDelete() {
    deleteProducts(loggedInUser?.isAdmin ?? true, products?.map((product) => product.id) || []).then(() =>
      mutateProducts(),
    );
  }

  return (
    <Modal
      open={isOpen}
      header={{ heading: "Er du sikker på du vil slette produktet?" }}
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
