import { Button, ConfirmationPanel, Modal, TextField, VStack } from "@navikt/ds-react";
import { useState } from "react";
import { saveVideoToSeries } from "api/SeriesApi";
import { validateUrl } from "products/videos/videoUrlUtils";
import { useErrorStore } from "utils/store/useErrorStore";

type VideoModalProps = {
  seriesId: string;
  mutateSeries: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const VideoModal = ({ seriesId, mutateSeries, isOpen, setIsOpen }: VideoModalProps) => {
  const { setGlobalError } = useErrorStore();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageConfirmVideoRequirements, setErrorMessageConfirmVideoRequirements] = useState("");
  const [confirmVideoRequirements, setConfirmVideoRequirements] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function handleSaveVideoLink() {
    const isUrlValid = validateVideoUrlRequirements();
    const isVideoRequirementsConfirmed = validateVideoRequirementsConfirmed();
    if (isUrlValid && isVideoRequirementsConfirmed) {
      saveVideoToSeries(seriesId, { uri: url, title: title }).then(
        () => {
          mutateSeries();
          setIsOpen(false);
        },
        (error) => {
          setGlobalError(error.status, error.statusText);
        },
      );
    }
  }

  const validateVideoUrlRequirements = () => {
    const urlError = validateUrl(url);
    if (urlError) {
      setErrorMessage(urlError);
      return false;
    }
    return true;
  };

  const validateVideoRequirementsConfirmed = () => {
    setErrorMessageConfirmVideoRequirements("");
    if (!confirmVideoRequirements) {
      setErrorMessageConfirmVideoRequirements("Du må bekrefte at kravene til videoer er oppfylt");
      return false;
    }
    return true;
  };

  const resetInputFields = () => {
    setTitle("");
    setUrl("");
    setErrorMessage("");
    setConfirmVideoRequirements(false);
    setErrorMessageConfirmVideoRequirements("");
  };

  return (
    <Modal
      open={isOpen}
      header={{
        heading: "Legg til videolenke",
        closeButton: true,
      }}
      onClose={() => {
        resetInputFields();
        setIsOpen(false);
      }}
    >
      <Modal.Body>
        <VStack gap="4">
          <TextField
            value={title}
            style={{ width: "400px" }}
            label="Tittel"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
          <TextField
            value={url}
            style={{ width: "400px" }}
            label="Lenke"
            description="Må være til en video og ikke en spilleliste, høyreklikk og kopier i videospilleren"
            onChange={(event) => setUrl(event.currentTarget.value)}
            onFocus={() => setErrorMessage("")}
            error={errorMessage}
          />
          <ConfirmationPanel
            checked={confirmVideoRequirements}
            label="Jeg bekrefter at kravene til videoer er oppfylt, herunder krav til universell utforming."
            onChange={() => setConfirmVideoRequirements((x) => !x)}
            onFocus={() => setErrorMessageConfirmVideoRequirements("")}
            error={errorMessageConfirmVideoRequirements}
          />
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => handleSaveVideoLink()} variant="primary">
          Lagre
        </Button>
        <Button
          onClick={() => {
            resetInputFields();
            setIsOpen(false);
          }}
          variant="secondary"
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
