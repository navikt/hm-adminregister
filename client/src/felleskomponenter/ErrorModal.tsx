import { Button, Modal } from "@navikt/ds-react";
import "./error-modal.scss";
import { useNavigate } from "react-router-dom";
import { useHydratedErrorStore } from "utils/store/useErrorStore";

const ErrorModal = () => {
  const { errorCode, errorMessage, clearError } = useHydratedErrorStore();
  const navigate = useNavigate();

  const handleClose = () => {
    clearError();
  };

  const handleClick = () => {
    clearError();
    if (errorCode === 401) {
      navigate("/logg-inn");
    } else navigate("/");
  };

  const getUserErrorMessage = () => {
    if (errorCode === 401) {
      return "Du må logge inn på nytt dersom du ønsker å fortsette";
    }
    if (errorCode === 403) {
      return "Du har ikke tilgang til å utføre denne operasjonen";
    }
    if (errorCode === 400) {
      //Dette bør ikke skje. Om det skjer så bør vi få vite om det. Vi bør lage noe som gir en alert i slack eller sentry
      return `En feil skjedde i forbindelse med innsendt data. ${errorMessage}`;
    }
    //Dette bør ikke skje. Om det skjer så bør vi få vite om det. Vi bør lage noe som gir en alert i slack eller sentry
    return `${errorCode}: ${errorMessage} 😣 Beklager, her skjedde det noe som ikke skal skje. Våre utviklere er på saken.`;
  };

  const heading = () => {
    if (errorCode === 401) return "Du er ikke lenger logget inn";
    else if (errorCode === 403) return "Du har ikke tilgang";
    else return "Ups, det skjedde en feil 😱";
  };

  return (
    <Modal
      open={errorCode ? true : false}
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
            {errorCode === 401 ? "Logg inn på nytt" : "Gå til hovedsiden"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
