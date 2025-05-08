import { SeriesDTO } from "utils/types/response-types";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { RocketIcon } from "@navikt/aksel-icons";
import { numberOfImages } from "products/seriesUtils";
import { requestApproval } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import styles from "./ProductPage.module.scss";
import { useAuthStore } from "utils/store/useAuthStore";

export const RequestApprovalModal = ({
  series,
  mutateSeries,
  isValid,
  isOpen,
  setIsOpen,
}: {
  series: SeriesDTO;
  mutateSeries: () => void;
  isValid: boolean;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();
  const { loggedInUser } = useAuthStore();

  async function onSendTilGodkjenning() {
    requestApproval(series.id)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const InvalidProductModal = () => {
    const AdminErrorMessages = () => {
      return <>{series.variants.length === 0 && <li>Produktet mangler teknisk data</li>}</>;
    };

    const SupplierErrorMessages = () => {
      return (
        <>
          {!series.text && <li>Produktet mangler en produktbeskrivelse</li>}
          {numberOfImages(series) < 2 && <li>Produktet må ha minst to bilder</li>}
          {series.variants.length === 0 && <li>Produktet mangler teknisk data</li>}
        </>
      );
    };

    return (
      <Modal open={isOpen} header={{ heading: "Produktet mangler data" }} onClose={() => setIsOpen(false)}>
        <Modal.Body>
          <BodyLong spacing>Det er noen feil som du må rette opp.</BodyLong>
          <BodyLong className={styles.errorText}>Vennligst rett opp følgende feil:</BodyLong>
          <ul className={styles.errorText}>
            {loggedInUser?.isAdmin ? <AdminErrorMessages /> : <SupplierErrorMessages />}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Lukk
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const RequestApprovalModal = () => {
    return (
      <Modal
        open={isOpen}
        header={{ icon: <RocketIcon aria-hidden />, heading: "Klar for godkjenning?" }}
        onClose={() => setIsOpen(false)}
      >
        <Modal.Body>
          <BodyLong>Før du sender til godkjenning, sjekk at:</BodyLong>
          <ul>
            <li>produktbeskrivelsen ikke inneholder tekniske data eller salgsord.</li>
            <li>tekniske data er korrekte.</li>
            <li>produktet inneholder nødvendig brosjyre, bruksanvisning etc.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              onSendTilGodkjenning().then(() => setIsOpen(false));
            }}
          >
            Send til godkjenning
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return isValid ? <RequestApprovalModal /> : <InvalidProductModal />;
};
