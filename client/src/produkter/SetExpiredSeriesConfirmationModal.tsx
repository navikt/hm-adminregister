import { Button, Heading, Modal } from "@navikt/ds-react";
import { setSeriesToActive, setSeriesToInactive } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import styles from "./SetExpiredSeriesConfirmationModal.module.scss";

export const SetExpiredSeriesConfirmationModal = ({
  series,
  mutateSeries,
  mutateProducts,
  params,
  setParams,
}: {
  series: SeriesRegistrationDTO;
  mutateSeries: () => void;
  mutateProducts: () => void;
  params: { open: boolean; newStatus: "ACTIVE" | "INACTIVE" | undefined };
  setParams: (params: { open: boolean; newStatus: "ACTIVE" | "INACTIVE" | undefined }) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onSetExpired() {
    if (params.newStatus === "ACTIVE") {
      setSeriesToActive(series.id, loggedInUser?.isAdmin || false)
        .then(() => {
          mutateSeries();
          mutateProducts();
        })
        .catch((error) => {
          setGlobalError(error);
        });
    } else if (params.newStatus === "INACTIVE") {
      setSeriesToInactive(series.id, loggedInUser?.isAdmin || false)
        .then(() => {
          mutateSeries();
          mutateProducts();
        })
        .catch((error) => {
          setGlobalError(error);
        });
    } else {
      console.log("Produktet som skal settes som utgått ble ikke funnet.");
    }
  }

  const headingText =
    params.newStatus === "ACTIVE"
      ? "Ønsker du å markere dette produktet og alle dens varianter som aktiv?"
      : "Ønsker du å markere dette produktet og alle dens varianter som utgått?";

  return (
    <Modal open={params.open} aria-label={headingText} onClose={() => setParams({ open: false, newStatus: undefined })}>
      <Modal.Header className={styles.modal_header}>
        {params.newStatus === "ACTIVE" ? (
          <Heading level="1" size="medium">
            Ønsker du å markere dette produktet og alle dens varianter som aktiv?
          </Heading>
        ) : (
          <Heading level="1" size="medium" style={{ whiteSpace: "pre" }}>
            {`Ønsker du å markere dette produktet \n og alle dens varianter som utgått?`}
          </Heading>
        )}
      </Modal.Header>
      <Modal.Footer>
        <Button
          onClick={() => {
            onSetExpired().then(() => setParams({ open: false, newStatus: undefined }));
          }}
        >
          {params.newStatus === "ACTIVE" ? "Marker som aktiv" : "Marker som utgått"}
        </Button>
        <Button variant="secondary" onClick={() => setParams({ open: false, newStatus: undefined })}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
