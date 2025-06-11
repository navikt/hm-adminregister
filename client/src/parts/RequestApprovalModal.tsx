import { PartDTO, SeriesDTO } from "utils/types/response-types";
import { BodyLong, Button, Modal } from "@navikt/ds-react";
import { RocketIcon } from "@navikt/aksel-icons";
import { useErrorStore } from "utils/store/useErrorStore";
import styles from "../products/ProductPage.module.scss";
import { approvePart } from "api/PartApi";

export const RequestApprovalModal = ({
  part,
  series,
  mutatePart,
  mutateSeries,
  partName,
  supplierRef,
  isValid,
  isOpen,
  setIsOpen,
}: {
  part: PartDTO;
  series: SeriesDTO | null;
  mutatePart: () => void;
  mutateSeries: () => void;
  partName: string | undefined;
  supplierRef: string | undefined;
  isValid: boolean;
  isOpen: boolean;
  setIsOpen: (newState: boolean) => void;
}) => {
  const { setGlobalError } = useErrorStore();

  const partIsValid = () => {
    const articleNameIsValid =partName && partName.trim().length > 0;
    const levartNrIsValid = supplierRef && supplierRef.trim().length > 0;
    return articleNameIsValid && levartNrIsValid || false
  };

  async function onPublish() {

    if (series && partIsValid()) {
      approvePart(series.id).then(
        () => {
          mutatePart()
          mutateSeries()
        }
      ).catch((error) => {
        setGlobalError(error.status, error.message);
      });
    }
  }

  const InvalidPartModal = () => {

    const ErrorMessages = () => {
      return (
        <>
          {!partName && <li>Delen må ha et navn</li>}
          {!supplierRef && <li>Delen må ha et levart-nummer</li>}
        </>
      );
    };

    return (
      <Modal open={isOpen} header={{ heading: "Delen mangler data" }} onClose={() => setIsOpen(false)}>
        <Modal.Body>
          <BodyLong spacing>Det er noen feil som du må rette opp.</BodyLong>
          <BodyLong className={styles.errorText}>Vennligst rett opp følgende feil:</BodyLong>
          <ul className={styles.errorText}>
            <ErrorMessages />
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
        header={{ icon: <RocketIcon aria-hidden />, heading: "Publiser del" }}
        onClose={() => setIsOpen(false)}
      >
        <Modal.Body>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              onPublish().then(() => setIsOpen(false));
            }}
          >
            Publiser
          </Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return isValid ? <RequestApprovalModal /> : <InvalidPartModal />;
};
