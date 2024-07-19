import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { deleteFileFromSeries } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import SeriesSortingArea from "products/tabs/SeriesSortingArea";
import styles from "./imagesTab.module.scss";

interface Props {
  series: SeriesRegistrationDTO;
  mutateSeries: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const ImagesTab = ({ series, mutateSeries, isEditable, showInputError }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { images } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();

  async function handleDeleteFile(fileURI: string) {
    deleteFileFromSeries(series.id, loggedInUser?.isAdmin || false, fileURI)
      .then(mutateSeries)
      .catch((error) => {
        setGlobalError(error);
      });
  }

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={series.id}
        fileType="images"
        mutateSeries={mutateSeries}
      />

      <Tabs.Panel value="images" className="tab-panel">
        <Alert variant="info" className={styles.alertSpacing}>
          Dra i bildene for å endre rekkefølgen som vises på finnHjelpemiddel.no
        </Alert>

        <VStack gap="8">
          {series && (
            <SeriesSortingArea
              allImages={images}
              series={series}
              mutateSeries={mutateSeries}
              handleDeleteFile={handleDeleteFile}
            />
          )}
          {!series && <Alert variant={showInputError ? "error" : "info"}>Produktet har ingen bilder</Alert>}

          {isEditable && (
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<PlusCircleIcon title="Legg til bilder" fontSize="1.5rem" />}
              onClick={() => {
                setModalIsOpen(true);
              }}
            >
              Legg til bilder
            </Button>
          )}
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default ImagesTab;
