import { useState } from "react";

import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { deleteFileFromSeries, useSeriesV2 } from "api/SeriesApi";
import SeriesSortingArea from "products/files/images/SeriesSortingArea";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import "../../product-page.scss";
import UploadModal from "../UploadModal";
import styles from "./ImagesTab.module.scss";

interface Props {
  series: SeriesRegistrationDTOV2;
  isEditable: boolean;
  showInputError: boolean;
}

const ImagesTab = ({ series, isEditable, showInputError }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { images } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();
  const { mutateSeries } = useSeriesV2(series.id);

  async function handleDeleteFile(fileURI: string) {
    deleteFileFromSeries(series.id, loggedInUser?.isAdmin || false, fileURI)
      .then(() => mutateSeries())
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
          Dra i bildene eller trykk på pilene for å endre rekkefølgen som vises på finnHjelpemiddel.no
        </Alert>

        <VStack gap="8">
          {series && <SeriesSortingArea allImages={images} seriesId={series.id} handleDeleteFile={handleDeleteFile} />}
          {!series && <Alert variant={showInputError ? "error" : "info"}>Produktet har ingen bilder</Alert>}

          {isEditable && (
            <Button
              className="fit-content"
              variant="tertiary"
              icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
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
