import { useState } from "react";

import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { deleteFileFromSeries, uploadFilesToSeries, useSeriesV2 } from "api/SeriesApi";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";
import { SeriesRegistrationDTOV2 } from "utils/types/response-types";
import styles from "./ImagesTab.module.scss";
import UploadModal, { FileUpload } from "felleskomponenter/UploadModal";
import productStyles from "../../ProductPage.module.scss";
import FellesSortingArea from "felleskomponenter/sort/FellesSortingArea";

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
  const { mutate: mutateSeries } = useSeriesV2(series.id);

  async function handleDeleteFile(fileURI: string) {
    deleteFileFromSeries(series.id, fileURI)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const uploadFiles = async (uploads: FileUpload[]) =>
    uploadFilesToSeries(series.id, loggedInUser?.isAdmin || false, uploads)
      .then(() => {
        mutateSeries();
        setModalIsOpen(false);
      })
      .catch((error) => {
        setGlobalError(error);
      });

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        fileType="images"
        uploadFiles={uploadFiles}
      />

      <Tabs.Panel value="images" className={productStyles.tabPanel}>
        {isEditable && (
          <Alert variant="info" className={styles.alertSpacing}>
            Dra i bildene eller trykk på pilene for å endre rekkefølgen som vises på finnHjelpemiddel.no
          </Alert>
        )}

        <VStack gap="8">
          {series && (
            <FellesSortingArea
              seriesId={series.id}
              allMedia={images}
              handleDeleteFile={handleDeleteFile}
              isEditable={isEditable}
            />
          )}
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
