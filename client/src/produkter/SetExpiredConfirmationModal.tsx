import { Button, Modal } from "@navikt/ds-react";
import { updateProductVariant } from "api/ProductApi";
import { todayTimestamp } from "utils/date-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { ProductRegistrationDTO } from "utils/types/response-types";

export const SetExpiredConfirmationModal = ({
  mutateProducts,
  params,
  setParams,
}: {
  mutateProducts: () => void;
  params: { open: boolean; product: ProductRegistrationDTO | undefined };
  setParams: (params: { open: boolean; product: ProductRegistrationDTO | undefined }) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onSetExpired() {
    if (!params.product) {
      console.log("Produktet som skal settes som utgått ble ikke funnet.");
      return;
    }
    const productRegistrationUpdated: ProductRegistrationDTO = {
      ...params.product,
      registrationStatus: "INACTIVE",
      expired: todayTimestamp(),
    };

    updateProductVariant(loggedInUser?.isAdmin || false, productRegistrationUpdated)
      .then(() => mutateProducts())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <Modal
      open={params.open}
      header={{
        heading: `Er du sikker på at du vil sette variant med artikkelnr ${
          params?.product?.supplierRef || ""
        } som utgått?`,
      }}
      onClose={() => setParams({ open: false, product: undefined })}
    >
      <Modal.Footer>
        <Button
          onClick={() => {
            onSetExpired().then(() => setParams({ open: false, product: undefined }));
          }}
        >
          Sett som utgått
        </Button>
        <Button variant="secondary" onClick={() => setParams({ open: false, product: undefined })}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
