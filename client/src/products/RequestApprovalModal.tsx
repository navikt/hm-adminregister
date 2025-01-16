import { SeriesDTO } from "utils/types/response-types";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { RocketIcon } from "@navikt/aksel-icons";
import { numberOfImages } from "products/seriesUtils";
import { requestApproval } from "api/SeriesApi";
import { useErrorStore } from "utils/store/useErrorStore";
import styles from "./ProductPage.module.scss";

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

  async function onSendTilGodkjenning() {
    requestApproval(series.id)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const InvalidProductModal = () => {
    return (
      <Modal open={isOpen} header={{ heading: "Produktet mangler data" }} onClose={() => setIsOpen(false)}>
        <Modal.Body>
          <BodyLong spacing>Det er noen feil som du må rette opp.</BodyLong>
          <BodyLong className={styles.errorText}>Vennligst rett opp følgende feil:</BodyLong>
          <ul className={styles.errorText}>
            {!series.text && <li>Produktet mangler en produktbeskrivelse</li>}
            {numberOfImages(series) === 0 && <li>Produktet mangler bilder</li>}
            {series.variants.length === 0 && <li>Produktet mangler teknisk data</li>}
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
          <BodyLong>
            <b>Obs:</b> produktet kan ikke endres i perioden det er lagt til godkjenning.
          </BodyLong>
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
