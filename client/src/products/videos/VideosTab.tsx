import {
  Alert,
  BodyLong,
  Button,
  ConfirmationPanel,
  Heading,
  HelpText,
  HStack,
  Link,
  Modal,
  Tabs,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { SeriesDTO } from "utils/types/response-types";

import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { deleteFileFromSeries, saveVideoToSeries } from "api/SeriesApi";
import styles from "../ProductPage.module.scss";
import { PlusCircleIcon } from "@navikt/aksel-icons";
import FellesSortingArea from "felleskomponenter/sort/FellesSortingArea";

const VideoTab = ({
  series,
  mutateSeries,
  isEditable,
}: {
  series: SeriesDTO;
  mutateSeries: () => void;
  isEditable: boolean;
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { videos } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageConfirmVideoRequirements, setErrorMessageConfirmVideoRequirements] = useState("");
  const [confirmVideoRequirements, setConfirmVideoRequirements] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function handleSaveVideoLink() {
    const isUrlValid = validateUrl();
    const isVideoRequirementsConfirmed = validateVideoRequirementsConfirmed();
    if (isUrlValid && isVideoRequirementsConfirmed) {
      saveVideoToSeries(series.id, { uri: url, title: title }).then(
        () => {
          mutateSeries();
          setModalIsOpen(false);
        },
        (error) => {
          setGlobalError(error.status, error.statusText);
        },
      );
    }
  }

  async function handleDeleteVideoLink(uri: string) {
    deleteFileFromSeries(series.id, uri)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const validateUrl = () => {
    setErrorMessage("");
    const parsedUrl = parseUrl(url);
    if (parsedUrl) {
      const isValidDomain = validateDomain(new URL(parsedUrl));
      if (!isValidDomain) {
        setErrorMessage("Kun lenker fra YouTube og Vimeo er tillatt");
      }
    } else {
      setErrorMessage("Ugyldig lenke. Eksempel på gyldig url er https://www.youtube.com/en-produkt-video");
    }

    return !errorMessage;
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
    <Tabs.Panel value="videos" className={styles.tabPanel}>
      <VStack gap="8">
        {videos.length === 0 && (
          <Alert variant="info">Videoene vises på FinnHjelpemiddel og vil sorteres alfabetisk.</Alert>
        )}

        <VideoRequirementBox />

        {videos.length > 0 && (
          <VStack gap="8 2">
            {series && (
              <FellesSortingArea
                seriesId={series.id}
                allMedia={videos}
                handleDeleteFile={handleDeleteVideoLink}
                isEditable={isEditable}
              />
            )}
          </VStack>
        )}

        {isEditable && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            Legg til videolenke
          </Button>
        )}
      </VStack>
      <Modal
        open={modalIsOpen}
        header={{
          heading: "Legg til videolenke",
          closeButton: true,
        }}
        onClose={() => {
          resetInputFields();
          setModalIsOpen(false);
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
              error={errorMessage}
            />
            <ConfirmationPanel
              checked={confirmVideoRequirements}
              label="Jeg bekrefter at kravene til videoer er oppfylt, herunder krav til universell utforming."
              onChange={() => setConfirmVideoRequirements((x) => !x)}
              error={errorMessageConfirmVideoRequirements}
            ></ConfirmationPanel>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleSaveVideoLink()} variant="primary">
            Lagre
          </Button>
          <Button
            onClick={() => {
              resetInputFields();
              setModalIsOpen(false);
            }}
            variant="secondary"
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </Tabs.Panel>
  );
};

export default VideoTab;

const parseUrl = (s: string) => {
  let urlString = s;
  if (!urlString.startsWith("http")) {
    urlString = "https://" + urlString;
  }
  try {
    return new URL(urlString);
  } catch {
    return false;
  }
};

//Ingen sikkerhet at dette kun ligger i frontend. For brukerinfo er det ok men sikkerheten må ligge i backend
const validateDomain = (url: URL) => {
  const validDomains = ["www.youtube.com", "youtube.com", "www.vimeo.com", "vimeo.com", "youtu.be"];
  return validDomains.some((d) => d === url.hostname);
};

const VideoRequirementBox = () => (
  <Alert variant="warning">
    <Heading spacing size="small" level="1">
      Krav til video
    </Heading>
    <BodyLong>- er på norsk, svensk eller dansk språk (engelsk kan unntaksvis benyttes)</BodyLong>
    <BodyLong>- er informativ og relevant til produktet</BodyLong>
    <BodyLong>- er nøytral og har et objektivt preg</BodyLong>
    <BodyLong>- er tekstet</BodyLong>
    <HStack>
      <BodyLong spacing>- er synstolket (gjelder videoer publisert etter 01.02.2024)</BodyLong>
      <HelpText title="Informasjon om synstolking">
        Synstolking betyr at viktig visuell informasjon i video bli beskrevet via lyd.
      </HelpText>
    </HStack>
    <BodyLong>
      Les mer på{" "}
      <Link href="https://www.uutilsynet.no/wcag-standarden/12-tidsbaserte-medier/743" target="_blank">
        Tilsynet for universell utforming sine nettsider
      </Link>
    </BodyLong>
  </Alert>
);
