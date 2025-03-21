import { FilePdfIcon, FloppydiskIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Tabs, TextField, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import { MediaInfoDTO, SeriesDTO } from "utils/types/response-types";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { useErrorStore } from "utils/store/useErrorStore";
import { uriForMediaFile } from "utils/file-util";
import { mapImagesAndPDFfromMedia } from "products/seriesUtils";
import { changeFilenameOnAttachedFile, deleteFileFromSeries, uploadFilesToSeries, useSeriesV2 } from "api/SeriesApi";
import UploadModal, { FileUpload } from "felleskomponenter/UploadModal";
import styles from "../ProductPage.module.scss";

interface Props {
  series: SeriesDTO;
  isEditable: boolean;
  showInputError: boolean;
}

const DocumentsTab = ({ series, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { pdfs } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();
  const { mutate: mutateSeries } = useSeriesV2(series.id);

  const allPdfsSorted = pdfs.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;

    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  async function handleDeleteFile(uri: string) {
    deleteFileFromSeries(series.id, uri)
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const handleEditFileName = async (uri: string, editedText: string) => {
    changeFilenameOnAttachedFile(series.id, { uri: uri, newFileTitle: editedText })
      .then(() => mutateSeries())
      .catch((error) => {
        setGlobalError(error);
      });
  };

  const uploadFiles = async (uploads: FileUpload[]) => {
    return uploadFilesToSeries(series.id, uploads)
      .then(() => {
        mutateSeries();
        setModalIsOpen(false);
      })
      .catch((error) => {
        setGlobalError(error);
      });
  };

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        fileType="documents"
        uploadFiles={uploadFiles}
      />
      <Tabs.Panel value="documents" className={styles.tabPanel}>
        <VStack gap="10">
          {allPdfsSorted.length === 0 && (
            <Alert variant={showInputError ? "error" : "info"}>
              Produktet har ingen dokumenter, her kan man for eksempel legge med brosjyre, bruksanvisning eller
              sprengskisse til produktet.
            </Alert>
          )}

          <VStack gap="1">
            {allPdfsSorted.length > 0 && (
              <VStack as="ol" gap="3" className={styles.documentListContainer}>
                {allPdfsSorted.map((pdf) => (
                  <DocumentListItem
                    key={pdf.uri}
                    isEditable={isEditable}
                    file={pdf}
                    handleDeleteFile={handleDeleteFile}
                    handleUpdateFileName={handleEditFileName}
                  />
                ))}
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
                Legg til dokumenter
              </Button>
            )}
          </VStack>
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default DocumentsTab;

const DocumentListItem = ({
  isEditable,
  file,
  handleDeleteFile,
  handleUpdateFileName,
}: {
  isEditable: boolean;
  file: MediaInfoDTO;
  handleDeleteFile: (uri: string) => void;
  handleUpdateFileName: (uri: string, text: string) => void;
}) => {
  const [editedFileText, setEditedFileText] = useState(file.text || "");
  const [editMode, setEditMode] = useState(false);
  const containerRef = useRef<HTMLInputElement>(null);

  const handleEditFileName = () => {
    setEditMode(true);
  };

  const handleSaveFileName = () => {
    setEditMode(false);
    handleUpdateFileName(file.uri, editedFileText);
  };

  const textLength = editedFileText.length + 4;

  return (
    <HStack as="li" justify="space-between" wrap={false}>
      {editMode ? (
        <>
          <TextField
            ref={containerRef}
            style={{ width: `${textLength}ch`, maxWidth: "550px", minWidth: "450px" }}
            label="Endre filnavn"
            value={editedFileText}
            onChange={(event) => setEditedFileText(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSaveFileName();
              }
            }}
          />
          <HStack align="end">
            <Button
              variant="tertiary"
              title="Lagre"
              onClick={handleSaveFileName}
              icon={<FloppydiskIcon fontSize="2rem" aria-hidden />}
            />
          </HStack>
        </>
      ) : (
        <>
          <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center" wrap={false}>
            <FilePdfIcon fontSize="2rem" title="Fil" />
            <a href={uriForMediaFile(file)} target="_blank" rel="noreferrer" className="text-overflow-hidden-large">
              {file.text || file.uri.split("/").pop()}
            </a>
          </HStack>
          {isEditable && (
            <HStack>
              <MoreMenu mediaInfo={file} handleDeleteFile={handleDeleteFile} handleEditFileName={handleEditFileName} />
            </HStack>
          )}
        </>
      )}
    </HStack>
  );
};
