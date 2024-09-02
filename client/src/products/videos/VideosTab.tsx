import { Alert, Button, HStack, Link, Modal, Tabs, TextField, VStack } from "@navikt/ds-react";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import { PlusCircleIcon } from "@navikt/aksel-icons";

import { useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import ReactPlayer from "react-player";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { deleteFileFromSeries, saveVideoToSeries } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import styles from "../ProductPage.module.scss";

const VideoTab = ({
  series,
  mutateSeries,
  isEditable,
}: {
  series: SeriesRegistrationDTOV2;
  mutateSeries: () => void;
  isEditable: boolean;
}) => {
  const { loggedInUser } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { videos } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  async function handleSaveVideoLink() {
    saveVideoToSeries(series.id, loggedInUser?.isAdmin || false, url, title).then(
      () => {
        mutateSeries();
        setModalIsOpen(false);
      },
      (error) => {
        setGlobalError(error.status, error.statusText);
      },
    );
  }

  async function handleDeleteVideoLink(uri: string) {
    deleteFileFromSeries(series.id, loggedInUser?.isAdmin || false, uri)
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
      if (isValidDomain) {
        handleSaveVideoLink();
      } else {
        setErrorMessage("Kun lenker fra YouTube og Vimeo er tillatt");
      }
    } else {
      setErrorMessage("Ugyldig lenke. Eksempel på gyldig url er https://www.example.com/");
    }
  };

  const resetInputFields = () => {
    setTitle("");
    setUrl("");
    setErrorMessage("");
  };

  return (
    <Tabs.Panel value="videos" className={styles.tabPanel}>
      <VStack gap="8">
        {videos.length === 0 && (
          <Alert variant="info">
            Produktet har ingen videolenker. Det er kun mulig å legge til lenker fra YouTube og Vimeo.
          </Alert>
        )}

        <Alert variant="warning">
          Sørg for at videoen som lenkes til er tekstet, har synstolking og at kravene til universell utforming følges.
          De som ikke kan høre lyd skal for eksempel få presentert lydinnholdet på en alternativ måte. Dette er
          lovpålagt.
          <Link href="https://www.uutilsynet.no/wcag-standarden/12-tidsbaserte-medier/743">
            Ytterligere informasjon om teksting av videoer finnes på nettsidene til Tilsynet for universell utforming av
            ikt
          </Link>
        </Alert>

        {videos.length > 0 && (
          <HStack as="ol" className={styles.videos} gap="4">
            {videos.map((video, i) => (
              <HStack as="li" key={video.uri}>
                <VStack gap="4">
                  <Link target="_blank" title={video.uri} href={video.uri}>
                    {video.text || video.uri}
                  </Link>
                  <ReactPlayer url={video.uri} controls={true} width="100%" height="fit-content" />
                </VStack>
                {isEditable && (
                  <div className={styles.moreMenuContainer}>
                    <MoreMenu mediaInfo={video} handleDeleteFile={handleDeleteVideoLink} />
                  </div>
                )}
              </HStack>
            ))}
          </HStack>
        )}

        {isEditable && (
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            onClick={() => setModalIsOpen(true)}
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
              onChange={(event) => setUrl(event.currentTarget.value)}
              error={errorMessage}
            />
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              validateUrl();
            }}
            variant="primary"
          >
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
    const url = new URL(urlString);
    return url;
  } catch {
    return false;
  }
};

//Ingen sikkerhet at dette kun ligger i frontend. For brukerinfo er det ok men sikkerheten må ligge i backend
const validateDomain = (url: URL) => {
  const validDomains = ["www.youtube.com", "youtube.com", "www.vimeo.com", "vimeo.com"];
  return validDomains.some((d) => d === url.hostname);
};
