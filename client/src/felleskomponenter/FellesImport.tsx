import {
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Label,
  Loader,
  UNSAFE_Combobox,
  VStack,
} from "@navikt/ds-react";
import React, { useRef, useState } from "react";
import { FileExcelIcon, FileImageFillIcon, TrashIcon, UploadIcon } from "@navikt/aksel-icons";
import { fileToUri, MIME_EXCEL_TYPES_ARRAY, MIME_EXCEL_TYPES_STRING } from "utils/file-util";
import { useSuppliers } from "utils/swr-hooks";

export interface Upload {
  file: File;
  previewUrl?: string;
}

export interface Props {
  validerImporterteProdukter: (upload: Upload) => void;
  setSupplier_: (supplier: string) => void;
  tekst: string;
}

export default function FellesImport({ validerImporterteProdukter, tekst, setSupplier_ }: Props) {
  const [isUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<Upload | undefined>(undefined);
  const [supplier, setSupplier] = useState<string | undefined>(undefined);
  const [fileTypeError, setFileTypeError] = useState("");
  const [moreThanOnefileError, setMoreThanOnefileError] = useState("");
  const { suppliers } = useSuppliers(true);

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
    const acceptedFileTypesDocuments = MIME_EXCEL_TYPES_ARRAY;

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

  const onToggleSelected = (option: string, isSelected: boolean) => {
    const uuid = suppliers?.find((supplier) => supplier.name === option)?.id;

    if (uuid) {
      if (isSelected) {
        setSupplier(uuid);
      } else {
        setSupplier(undefined);
      }
    }
  };

  return (
    <main>
      <div className="import-products">
        <div className="content">
          <Heading level="1" size="large" align="center">
            {tekst}
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
                accept={MIME_EXCEL_TYPES_STRING}
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

          {upload && suppliers && (
            <Box asChild style={{ maxWidth: "475px" }}>
              <UNSAFE_Combobox
                clearButton
                clearButtonLabel="Tøm"
                label="Leverandør"
                selectedOptions={supplier ? [suppliers.find((s) => s.id === supplier)?.name || ""] : undefined}
                onToggleSelected={onToggleSelected}
                options={suppliers?.map((supplier) => supplier.name) || []}
              />
            </Box>
          )}

          {upload && (
            <VStack as="ol" gap="3" className="images-inline">
              <HStack as="li" justify="space-between" align="center" key={`xlxs}`}>
                <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                  <FileExcelIcon fontSize="1.5rem" aria-hidden />

                  <Label>{upload.file.name}</Label>
                </HStack>
                <Button
                  variant="tertiary"
                  icon={<TrashIcon aria-hidden />}
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
              disabled={!upload || !supplier}
              size="medium"
              variant="primary"
              onClick={() => {
                validerImporterteProdukter(upload!);
                setSupplier_(supplier!);
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
