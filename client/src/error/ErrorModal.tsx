import "./error-modal.scss";
import { useNavigate } from "react-router-dom";
import { useErrorStore } from "utils/store/useErrorStore";
import { Button, Modal } from "@navikt/ds-react";

const ErrorModal = () => {
  const { errorCode, errorMessage, clearError } = useErrorStore();
  const navigate = useNavigate();

  const handleClose = () => {
    clearError();
  };

  const handleClick = () => {
    clearError();
    navigate("/");
  };

  const getUserErrorMessage = () => {
    if (errorCode === 403) {
      return "Du har ikke tilgang til å utføre denne operasjonen";
    }
    if (errorCode === 400) {
      //Dette bør ikke skje. Om det skjer så bør vi få vite om det. Vi bør lage noe som gir en alert i slack eller sentry
      return `En feil skjedde i forbindelse med innsendt data. ${errorMessage}`;
    }
    if (errorCode === 500) {
      return `En serverfeil har skjedd. Oppdater siden eller prøv igjen.`;
    }
    //Dette bør ikke skje. Om det skjer så bør vi få vite om det. Vi bør lage noe som gir en alert i slack eller sentry
    return `${errorCode}: ${errorMessage} 😣 Beklager, her skjedde det noe som ikke skal skje. Våre utviklere er på saken.`;
  };

  const heading = () => {
    if (errorCode === 403) return "Du har ikke tilgang";
    else return "Ups, det skjedde en feil 😱";
  };

  return (
    <Modal
      open={!!errorCode}
      header={{
        heading: heading(),
        closeButton: true,
      }}
      onClose={handleClose}
      className="error-modal"
    >
      <Modal.Body className="error-modal__body">{getUserErrorMessage()}</Modal.Body>
      <Modal.Footer>
        {errorCode !== 400 && (
          <Button className="error-modal__button" onClick={handleClick}>
            Gå til hovedsiden
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
