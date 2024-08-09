import { Button, Heading, Modal } from "@navikt/ds-react";
import { approveMultipleSeries } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import styles from "./PublishMultipleSeriesModal.module.scss";
import { useState } from "react";

export const PublishMultipleSeriesModal = ({
  seriesIds,
  isOpen,
  setIsOpen,
  mutateSeries,
  setSelectedRows,
}: {
  seriesIds: string[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mutateSeries: () => void;
  setSelectedRows: (selectedRows: string[]) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onPublishMultipleSeries() {
    setIsLoading(true);
    approveMultipleSeries(seriesIds)
      .then(() => {
        mutateSeries();
        setSelectedRows([]);
        setIsLoading(false);
        setIsOpen(false);
      })
      .catch((error) => {
        setGlobalError(error);
        setIsLoading(false);
      });
  }

  return (
    <Modal open={isOpen} aria-label="Godkjenn serier" onClose={() => setIsOpen(false)}>
      <Modal.Header className={styles.modal_header}>
        <Heading level="1" size="medium">
          Ønsker du å godkjenne {seriesIds.length} valgte serier?
        </Heading>
      </Modal.Header>
      <Modal.Footer>
        <Button onClick={onPublishMultipleSeries} disabled={isLoading}>
          OK
        </Button>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
