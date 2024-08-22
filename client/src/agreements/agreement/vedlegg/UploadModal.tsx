import { FileImageFillIcon, TrashIcon, UploadIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Button, Heading, HStack, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { fileToUri } from "utils/file-util";
import { uploadFilesToAgreement } from "api/AgreementApi";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  setModalIsOpen: (open: boolean) => void;
  mutateAgreement: () => void;
  agreementAttachmentId: string;
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

const UploadModal = ({ modalIsOpen, oid, setModalIsOpen, mutateAgreement, agreementAttachmentId }: Props) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [fileTypeError, setFileTypeError] = useState("");

  const { handleSubmit } = useForm();
  const { setGlobalError } = useErrorStore();

  async function onSubmit() {
    setIsUploading(true);

    uploadFilesToAgreement(oid, agreementAttachmentId, uploads)
      .then(() => {
        setIsUploading(false);
        mutateAgreement();
        setUploads([]);
        setModalIsOpen(false);
      })
      .catch((error) => {
        setIsUploading(false);
        setGlobalError(error);
      });
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.currentTarget?.files || []);
    handleMediaEvent(files);
  };

  const handleDelete = (file: File) => {
    const filteredFiles = uploads.filter((upload) => upload.file !== file);
    setUploads(filteredFiles);
  };

  const setEditedFileName = (upload: FileUpload, newFileName: string) => {
    setUploads((prevUploads) =>
      prevUploads.map((prevUpload) =>
        prevUpload.previewUrl === upload.previewUrl ? { ...prevUpload, editedFileName: newFileName } : prevUpload,
      ),
    );
  };

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError("");
    //Check is file is a picture as it is possible to drop any type of file
    event.preventDefault();
    const acceptedFileTypesDocuments = ["application/pdf"];

    const files = Array.from(event.dataTransfer.files);
    const isValidFiles = files.every((file) => acceptedFileTypesDocuments.includes(file.type));

    if (!isValidFiles) {
      setFileTypeError("Ugyldig filtype. Kun pdf er gyldig dokumenttype.");

      return;
    }
    handleMediaEvent(files);
  };

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

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Legg til dokumenter",
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
            <FileImageFillIcon className="images-tab__upload-icon" fontSize="4rem" aria-hidden />
            <BodyShort className="images-tab__text">Slipp dokumentet her eller</BodyShort>
            <Button
              size="small"
              variant="secondary"
              icon={<UploadIcon fontSize="1.5rem" aria-hidden />}
              iconPosition="right"
              onClick={(event) => {
                event.preventDefault();
                fileInputRef?.current?.click();
              }}
            >
              Last opp
            </Button>
            <input
              id="fileInput"
              onChange={(event) => handleChange(event)}
              multiple={true}
              ref={fileInputRef}
              type="file"
              hidden
              accept={"application/pdf"}
            />
          </div>

          {isUploading && (
            <HStack justify="center">
              <Loader size="2xlarge" title="venter..." />
            </HStack>
          )}

          {fileTypeError && <BodyLong>{fileTypeError}</BodyLong>}
          <VStack as="ol" gap="3" className="images-inline">
            {uploads.length > 0 && <Heading size="small">Filnavn som vises på finnhjelpemidler.no</Heading>}
            {uploads.map((upload, i) => (
              <Upload
                key={`${upload.file.name}`}
                upload={upload}
                handleDelete={handleDelete}
                setEditedFileName={setEditedFileName}
              />
            ))}
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant="primary">
            Lagre
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setModalIsOpen(false);
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
  handleDelete,
  setEditedFileName,
}: {
  upload: FileUpload;
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
      <HStack align="end">
        <Button
          variant="tertiary"
          title="slett"
          onClick={(event) => {
            event.preventDefault();
            handleDelete(upload.file);
          }}
          icon={<TrashIcon fontSize="2rem" aria-hidden />}
        />
      </HStack>
    </HStack>
  );
};
