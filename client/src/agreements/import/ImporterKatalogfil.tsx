import { BodyLong, BodyShort, Button, Heading, HStack, Label, Loader, VStack } from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { FileExcelIcon, FileImageFillIcon, TrashIcon, UploadIcon } from "@navikt/aksel-icons";
import { fileToUri } from "utils/file-util";

export interface Upload {
  file: File;
  previewUrl?: string;
}

export interface Props {
  validerImporterteProdukter: (upload: Upload) => void;
}

export default function ImporterKatalogfil({ validerImporterteProdukter }: Props) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const [fileTypeError, setFileTypeError] = useState("");
  const [moreThanOnefileError, setMoreThanOnefileError] = useState("");

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileTypeError("");
    setMoreThanOnefileError("");
    const files = Array.from(event?.currentTarget?.files || []);

    if (files.length !== 1) {
      setMoreThanOnefileError("Du kan kun laste opp en fil om gangen.");
      return;
    }

    const file = files[0];
    fileToUri(file).then((url) => {
      setUpload({ file, previewUrl: url });
    });
  };

  const handleDragEvent = (event: React.DragEvent<HTMLDivElement>) => {
    setFileTypeError("");
    setMoreThanOnefileError("");
    event.preventDefault();
    const acceptedFileTypesDocuments = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

    const files = Array.from(event.dataTransfer.files);
    const isValidFiles = files.every((file) => acceptedFileTypesDocuments.includes(file.type));

    if (!isValidFiles) {
      setFileTypeError("Ugyldig filtype. Kun xlsx er gyldig dokumenttype.");
      return;
    }

    if (files.length !== 1) {
      setMoreThanOnefileError("Du kan kun laste opp en fil om gangen.");
      return;
    }

    const file = files[0];
    fileToUri(file).then((url) => {
      setUpload({ file, previewUrl: url });
    });
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>, file: File) => {
    event.preventDefault();
    setUpload(undefined);
  };

  return (
    <main>
      <div className="import-products">
        <div className="content">
          <Heading level="1" size="large" align="center">
            Importer katalogfil
          </Heading>
          <BodyShort>Velg importfil fra din maskin og last opp. Filen må være i .xlsx format.</BodyShort>

          {!upload && (
            <div
              onDragEnter={handleDragEvent}
              onDragLeave={handleDragEvent}
              onDragOver={handleDragEvent}
              onDrop={handleDragEvent}
              className="images-tab__upload-container"
            >
              <FileImageFillIcon className="images-tab__upload-icon" fontSize="4rem" aria-hidden />
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
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </div>
          )}

          {isUploading && (
            <HStack justify="center">
              <Loader size="2xlarge" title="venter..." />
            </HStack>
          )}

          {fileTypeError && <BodyLong>{fileTypeError}</BodyLong>}
          {moreThanOnefileError && <BodyLong>{moreThanOnefileError}</BodyLong>}

          {upload && (
            <VStack as="ol" gap="3" className="images-inline">
              <HStack as="li" justify="space-between" align="center" key={`xlxs}`}>
                <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                  <FileExcelIcon fontSize="1.5rem" />

                  <Label>{upload.file.name}</Label>
                </HStack>
                <Button
                  variant="tertiary"
                  icon={<TrashIcon />}
                  title="slett"
                  onClick={(event) => handleDelete(event, upload.file)}
                />
              </HStack>
            </VStack>
          )}

          <HStack justify="end" gap="4">
            <Button
              className="fit-content"
              size="medium"
              variant="secondary"
              iconPosition="right"
              onClick={() => {
                history.back();
              }}
            >
              Avbryt
            </Button>
            <Button
              disabled={!upload}
              size="medium"
              variant="primary"
              onClick={(event) => {
                validerImporterteProdukter(upload!);
              }}
            >
              Gå videre
            </Button>
          </HStack>
        </div>
      </div>
    </main>
  );
}
