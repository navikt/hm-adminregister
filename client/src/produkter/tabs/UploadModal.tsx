import {
  FileImageFillIcon,
  FilePdfIcon,
  FloppydiskIcon,
  PencilWritingIcon,
  TrashIcon,
  UploadIcon,
} from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Button, HStack, Label, Loader, Modal, TextField, VStack } from "@navikt/ds-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useErrorStore } from "utils/store/useErrorStore";
import { MediaDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { getEditedProductDTOAddMedia, mapToMediaInfo } from "utils/product-util";
import { ImageContainer } from "felleskomponenter/ImageCard";
import { HM_REGISTER_URL } from "environments";
import { fileToUri } from "utils/file-util";

interface Props {
  modalIsOpen: boolean;
  oid: string;
  fileType: "images" | "documents";
  setModalIsOpen: (open: boolean) => void;
  mutateProducts: () => void;
}

export interface Upload {
  file: File;
  previewUrl?: string;
  editedFileName?: string;
}

const UploadModal = ({ modalIsOpen, oid, fileType, setModalIsOpen, mutateProducts }: Props) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [fileTypeError, setFileTypeError] = useState("");

  const { handleSubmit } = useForm();
  const { setGlobalError } = useErrorStore();

  async function onSubmit() {
    setIsUploading(true);
    const formData = new FormData();
    for (const upload of uploads) {
      formData.append("files", upload.file);
    }

    //1. save file to media endpoint (here we use js File which means it will always be saved with the original filename. A file cannot be changed)
    let res = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/media/product/files/${oid}`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      setGlobalError(res.status, res.statusText);
      return;
    }

    const mediaDTOs: MediaDTO[] = await res.json();

    //2. save file to product with edited filename if the user have changed it (display name)
    //Fetch produkt to update the latest version
    res = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${oid}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      setGlobalError(res.status, res.statusText);
      return;
    }

    const productToUpdate: ProductRegistrationDTO = await res.json();

    const editedProductDTO =
      mediaDTOs && getEditedProductDTOAddMedia(productToUpdate, mapToMediaInfo(mediaDTOs, uploads));

    res = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${productToUpdate.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(editedProductDTO),
    });
    if (!res.ok) {
      setGlobalError(res.status, res.statusText);
      return;
    }
    setIsUploading(false);
    mutateProducts();
    setUploads([]);
    setModalIsOpen(false);
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event?.currentTarget?.files || []);

    const allChosenFiles = uploads.concat(files.map((file) => ({ file, editedFileName: file.name }))); // Add editedFileName
    setUploads(allChosenFiles);

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        })),
      );
    });
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
    const allChosenFiles = uploads.concat(files.map((file) => ({ file })));
    setUploads(allChosenFiles);

    Promise.all(files.map(fileToUri)).then((urls) => {
      setUploads((previousState) =>
        previousState.map((f) => ({
          ...f,
          previewUrl: f.previewUrl || urls[files.findIndex((a) => a === f.file)],
        })),
      );
    });
  };

  const setEditedFileName = (upload: Upload, newFileName: string) => {
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
          <Button type="submit" variant="primary">
            Last opp
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
  fileType,
  handleDelete,
  setEditedFileName,
}: {
  upload: Upload;
  fileType: "images" | "documents";
  handleDelete: (file: File) => void;
  setEditedFileName: (upload: Upload, newfileName: string) => void;
}) => {
  //Need to initialize filName state with file.name because thats what the user chooses to upload. Then they can change it.
  const [fileName, setFileName] = useState(upload.file.name);
  const [editMode, setEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileNameInputRef = useRef<HTMLInputElement>(null);

  const handleChangeFileName = () => {
    setEditMode(false);
    setEditedFileName(upload, fileName);
  };

  useEffect(() => {
    if (editMode && fileNameInputRef.current) {
      fileNameInputRef.current.focus();
    }
  }, [editMode]);

  const validateFileName = () => {
    setErrorMessage("");
    if (fileName.trim().length !== 0) {
      handleChangeFileName();
    } else {
      setErrorMessage("Filen må ha et navn");
    }
  };

  return (
    <HStack as="li" justify="space-between" wrap={false}>
      {editMode && fileType === "documents" ? (
        <>
          <TextField
            ref={fileNameInputRef}
            style={{ width: "500px" }}
            label="Endre filnavn"
            value={fileName}
            onChange={(event) => setFileName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                validateFileName();
              }
            }}
            error={errorMessage}
          />
          <HStack align="end">
            <Button
              variant="tertiary"
              title="Lagre"
              onClick={(event) => {
                event.preventDefault();
                validateFileName();
              }}
              icon={<FloppydiskIcon fontSize="2rem" />}
            />
          </HStack>
        </>
      ) : (
        <>
          <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center" wrap={false}>
            {fileType === "images" ? (
              <ImageContainer uri={upload.previewUrl} size="xsmall" />
            ) : (
              <FilePdfIcon fontSize="1.5rem" />
            )}
            <Label className="text-overflow-hidden">{fileName}</Label>
          </HStack>

          <HStack>
            {fileType === "documents" && (
              <Button
                variant="tertiary"
                title="rediger"
                onClick={(event) => {
                  event.preventDefault();
                  setEditMode(true);
                }}
                icon={<PencilWritingIcon fontSize="1.5rem" />}
              />
            )}

            <Button
              variant="tertiary"
              title="slett"
              onClick={(event) => {
                event.preventDefault();
                handleDelete(upload.file);
              }}
              icon={<TrashIcon fontSize="1.5rem" />}
            />
          </HStack>
        </>
      )}
    </HStack>
  );
};
