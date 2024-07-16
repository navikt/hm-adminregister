import { FilePdfIcon, FloppydiskIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Tabs, TextField, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { MediaInfoDTO, SeriesRegistrationDTO } from "utils/types/response-types";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { useErrorStore } from "utils/store/useErrorStore";
import { uriForMediaFile } from "utils/file-util";
import { mapImagesAndPDFfromMedia } from "produkter/seriesUtils";
import { changeFilenameOnAttachedFile, deleteFileFromSeries } from "api/SeriesApi";
import { useAuthStore } from "utils/store/useAuthStore";

interface Props {
  series: SeriesRegistrationDTO;
  mutateSeries: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const DocumentsTab = ({ series, mutateSeries, isEditable, showInputError }: Props) => {
  const { loggedInUser } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { pdfs } = mapImagesAndPDFfromMedia(series);
  const { setGlobalError } = useErrorStore();

  const allPdfsSorted = pdfs.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;

    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  async function handleDeleteFile(uri: string) {
    deleteFileFromSeries(series.id, loggedInUser?.isAdmin || false, uri)
      .then(mutateSeries)
      .catch((error) => {
        setGlobalError(error);
      });
  }

  const handleEditFileName = async (uri: string, editedText: string) => {
    changeFilenameOnAttachedFile(series.id, loggedInUser?.isAdmin || false, uri, editedText)
      .then(mutateSeries)
      .catch((error) => {
        setGlobalError(error);
      });
  };

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={series.id}
        fileType="documents"
        mutateSeries={mutateSeries}
      />
      <Tabs.Panel value="documents" className="tab-panel">
        <VStack gap="10">
          {allPdfsSorted.length === 0 && (
            <Alert variant={showInputError ? "error" : "info"}>
              Produktet har ingen dokumenter, her kan man for eksempel legge med brosjyre eller bruksanvisning til
              produktet.
            </Alert>
          )}

          <VStack gap="1" className="documents-conatainer">
            {allPdfsSorted.length > 0 && (
              <VStack as="ol" gap="3" className="document-list-container">
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
                icon={<PlusCircleIcon title={"Legg til dokumenter"} fontSize="1.5rem" />}
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
              icon={<FloppydiskIcon fontSize="2rem" />}
            />
          </HStack>
        </>
      ) : (
        <>
          <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center" wrap={false}>
            <FilePdfIcon fontSize="2rem" />
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
