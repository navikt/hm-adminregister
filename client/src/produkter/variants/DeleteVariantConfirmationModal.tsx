import { Button, Modal } from "@navikt/ds-react";

export const DeleteVariantConfirmationModal = ({
  onDelete,
  params,
  setParams,
}: {
  onDelete: (variantId: string) => Promise<void>;
  params: { open: boolean; variantId: string | undefined };
  setParams: (params: { open: boolean; variantId: string | undefined }) => void;
}) => {
  if (!params.variantId) {
    console.log("Varianten som skal slettes ble ikke funnet.");
  }

  return (
    <Modal
      open={params.open}
      header={{ heading: "Er du sikker på at du vil slette varianten?" }}
      onClose={() => setParams({ open: false, variantId: undefined })}
    >
      <Modal.Footer>
        <Button
          onClick={() => {
            params.variantId && onDelete(params.variantId).then(() => setParams({ open: false, variantId: undefined }));
          }}
        >
          Slett
        </Button>
        <Button variant="secondary" onClick={() => setParams({ open: false, variantId: undefined })}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
