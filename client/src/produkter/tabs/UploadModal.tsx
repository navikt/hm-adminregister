import { FileImageFillIcon, TrashIcon, UploadIcon } from "@navikt/aksel-icons";
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  HStack,
  Label,
  Loader,
  Modal,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { ImageContainer } from "felleskomponenter/ImageCard";
import { fileToUri } from "utils/file-util";
import { uploadFilesToSeries } from "api/MediaApi";
import { useAuthStore } from "utils/store/useAuthStore";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  fileType: "images" | "documents";
  setModalIsOpen: (open: boolean) => void;
  mutateSeries: () => void;
}

const removeFileExtation = (fileName: string) => {
  if (fileName.includes(".")) {
    return fileName.split(".")[0];
  }
  return fileName;
};

export interface FileUpload {
  file: File;
  previewUrl?: string;
  editedFileName?: string;
}

const UploadModal = ({ modalIsOpen, oid, fileType, setModalIsOpen, mutateSeries }: Props) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [fileTypeError, setFileTypeError] = useState("");
  const { loggedInUser } = useAuthStore();
  const { handleSubmit } = useForm();
  const { setGlobalError } = useErrorStore();

  async function onSubmit() {
    setIsUploading(true);

    uploadFilesToSeries(oid, loggedInUser?.isAdmin || false, uploads)
      .then(() => {
        setIsUploading(false);
        mutateSeries();
        setUploads([]);
        setModalIsOpen(false);
      })
      .catch((error) => {
        setIsUploading(false);
        setGlobalError(error);
      });
  }

  const handleMediaEvent = (files: File[]) => {
    const allChosenFiles = uploads.concat(
      files.map((file) => ({ file, editedFileName: removeFileExtation(file.name) })),
    );

    const uniqueAllChosenFiles = allChosenFiles.filter(
      (item, index, uploadList) =>
        index ===
        uploadList.findIndex((compareItem) => {
          return compareItem.file.name === item.file.name;
        }),
    );

    setUploads(uniqueAllChosenFiles);

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        })),
      );
    });
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.currentTarget?.files || []);
    handleMediaEvent(files);
  };

  const handleDelete = (file: File) => {
    const filteredFiles = uploads.filter((upload) => upload.file !== file);
    setUploads(filteredFiles);
  };

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError("");
    //Check is file is a picture as it is possible to drop any type of file
    event.preventDefault();
    const acceptedFileTypesImages = ["image/jpeg", "image/jpg", "image/png"];
    const acceptedFileTypesDocuments = ["application/pdf"];

    const files = Array.from(event.dataTransfer.files);
    const isValidFiles = files.every((file) =>
      fileType === "images"
        ? acceptedFileTypesImages.includes(file.type)
        : acceptedFileTypesDocuments.includes(file.type),
    );

    if (!isValidFiles) {
      fileType === "images"
        ? setFileTypeError("Ugyldig filtype. Vennligst velg en av disse filtypene jpeg, jpg, eller png.")
        : setFileTypeError("Ugyldig filtype. Kun pdf er gyldig dokumenttype.");

      return;
    }
    handleMediaEvent(files);
  };

  const setEditedFileName = (upload: FileUpload, newFileName: string) => {
    setUploads((prevUploads) =>
      prevUploads.map((prevUpload) =>
        prevUpload.previewUrl === upload.previewUrl ? { ...prevUpload, editedFileName: newFileName } : prevUpload,
      ),
    );
  };

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: fileType === "images" ? "Legg til bilder" : "Legg til dokumenter",
        closeButton: true,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <div
            onDragEnter={handleDragEvent}
            onDragLeave={handleDragEvent}
            onDragOver={handleDragEvent}
            onDrop={handleDragEvent}
            className="images-tab__upload-container"
          >
            <FileImageFillIcon className="images-tab__upload-icon" title="filillustarsjon" fontSize="4rem" />
            <BodyShort className="images-tab__text">Slipp filen her eller</BodyShort>
            <Button
              size="small"
              variant="secondary"
              icon={<UploadIcon title="Last opp bilde" fontSize="1.5rem" />}
              iconPosition="right"
              onClick={(event) => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                event.preventDefault();
                fileInputRef?.current?.click();
              }}
            >
              Bla gjennom
            </Button>
            <input
              id="fileInput"
              onChange={(event) => handleChange(event)}
              multiple={true}
              ref={fileInputRef}
              type="file"
              hidden
              accept={fileType === "images" ? "image/jpeg, image/jpg, image/png" : "application/pdf"}
            />
          </div>

          {isUploading && (
            <HStack justify="center">
              <Loader size="2xlarge" title="venter..." />
            </HStack>
          )}

          {fileTypeError && <BodyLong>{fileTypeError}</BodyLong>}
          <VStack as="ol" gap="3" className="images-inline">
            {fileType === "documents" && uploads.length > 0 && (
              <Heading size="small">Filnavn som vises på finnhjelpemidler.no</Heading>
            )}
            {uploads.map((upload) => (
              <Upload
                key={`${upload.file.name}`}
                upload={upload}
                fileType={fileType}
                handleDelete={handleDelete}
                setEditedFileName={setEditedFileName}
              />
            ))}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            variant="primary"
            disabled={uploads.some((value) => value.editedFileName?.trim().length === 0) || uploads.length === 0}
          >
            Last opp
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setModalIsOpen(false);
              setUploads([]);
            }}
            variant="secondary"
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default UploadModal;

const Upload = ({
  upload,
  fileType,
  handleDelete,
  setEditedFileName,
}: {
  upload: FileUpload;
  fileType: "images" | "documents";
  handleDelete: (file: File) => void;
  setEditedFileName: (upload: FileUpload, newfileName: string) => void;
}) => {
  //Need to initialize filName state with file.name because thats what the user chooses to upload. Then they can change it.
  const [fileName, setFileName] = useState(upload.editedFileName || "");
  const [onCreation] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const fileNameInputRef = useRef<HTMLInputElement>(null);

  function isTextSelected() {
    const selection = window.getSelection();
    return selection && selection.rangeCount > 0 && selection.toString().length > 0;
  }
  useEffect(() => {
    if (fileNameInputRef.current && !isTextSelected()) {
      fileNameInputRef.current.select();
      fileNameInputRef.current.focus();
    }
  }, [onCreation]);

  const validateFileName = () => {
    setErrorMessage("");

    if (fileName.trim().length == 0) {
      setErrorMessage("Filen må ha et navn");
    }
  };

  return (
    <HStack as="li" justify="space-between" wrap={false}>
      {fileType === "documents" ? (
        <>
          <TextField
            ref={fileNameInputRef}
            style={{ width: "500px" }}
            label={"Endre filnavn"}
            value={fileName}
            onChange={(event) => {
              event.preventDefault();
              setEditedFileName(upload, fileName);
              validateFileName();
              setFileName(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
            onKeyUp={(event) => {
              setEditedFileName(upload, fileName);
              validateFileName();
              setFileName(event.currentTarget.value);
            }}
            error={errorMessage}
          />
        </>
      ) : (
        <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center" wrap={false}>
          <ImageContainer uri={upload.previewUrl} size="xsmall" />
          <Label className="text-overflow-hidden-large">{fileName}</Label>
        </HStack>
      )}
      <HStack align="end">
        <Button
          variant="tertiary"
          title="slett"
          onClick={(event) => {
            event.preventDefault();
            handleDelete(upload.file);
          }}
          icon={<TrashIcon fontSize="2rem" />}
        />
      </HStack>
    </HStack>
  );
};
