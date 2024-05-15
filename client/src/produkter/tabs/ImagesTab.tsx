import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageCard } from "felleskomponenter/ImageCard";
import { mapImagesAndPDFfromMedia } from "produkter/seriesUtils";
import { deleteFileFromSeries } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";
import { useErrorStore } from "utils/store/useErrorStore";

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

  const sortedImages = images.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;
    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

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
        <VStack gap="8">
          <>
            {sortedImages.length > 0 && (
              <ol className="images">
                {sortedImages.map((image) => (
                  <ImageCard
                    mediaInfo={image}
                    key={image.uri}
                    handleDeleteFile={handleDeleteFile}
                    showMenuButton={isEditable}
                  />
                ))}
              </ol>
            )}
            {sortedImages.length === 0 && (
              <Alert variant={showInputError ? "error" : "info"}>Produktet har ingen bilder</Alert>
            )}
          </>

          {isEditable && (
            <>
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
            </>
          )}
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default ImagesTab;
