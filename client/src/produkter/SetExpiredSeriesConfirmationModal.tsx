import { Alert, Button, Modal } from "@navikt/ds-react";
import { setSeriesToActive, setSeriesToInactive } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTO } from "utils/types/response-types";

export const SetExpiredSeriesConfirmationModal = ({
  series,
  mutateSeries,
  params,
  setParams,
}: {
  series: SeriesRegistrationDTO;
  mutateSeries: () => void;
  params: { open: boolean; newStatus: "ACTIVE" | "INACTIVE" | undefined };
  setParams: (params: { open: boolean; newStatus: "ACTIVE" | "INACTIVE" | undefined }) => void;
}) => {
  const { loggedInUser } = useAuthStore();
  const { setGlobalError } = useErrorStore();

  async function onSetExpired() {
    switch (params.newStatus) {
      case "ACTIVE":
        setSeriesToActive(series.id, loggedInUser?.isAdmin || false)
          .then(() => {
            mutateSeries();
          })
          .catch((error) => {
            setGlobalError(error);
          });
      case "INACTIVE":
        setSeriesToInactive(series.id, loggedInUser?.isAdmin || false)
          .then(() => {
            mutateSeries();
          })
          .catch((error) => {
            setGlobalError(error);
          });
      case undefined:
        console.log("Produktet som skal settes som utgått ble ikke funnet.");
        return;
    }
  }

  const headingText =
    params.newStatus === "ACTIVE"
      ? "Er du sikker på at du vil ta bort utgått markering på produktet og alle variantene?"
      : "Er du sikker på at du vil sette produktet og alle variantene som utgått?";

  return (
    <Modal
      open={params.open}
      header={{
        heading: `Er du sikker på at du vil sette produktet og alle variantene som utgått?`,
      }}
      onClose={() => setParams({ open: false, newStatus: undefined })}
    >
      <Modal.Body>
        {params.newStatus === "INACTIVE" && (
          <Alert variant="warning">Dersom du reverserer dette senere, så settes alle variantene som ikke utgått.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            onSetExpired().then(() => setParams({ open: false, newStatus: undefined }));
          }}
        >
          {params.newStatus === "ACTIVE" ? "Fjern utgått markering" : "Sett som utgått"}
        </Button>
        <Button variant="secondary" onClick={() => setParams({ open: false, newStatus: undefined })}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
