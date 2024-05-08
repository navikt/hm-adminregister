import { FilePdfIcon, FloppydiskIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Tabs, TextField, VStack } from "@navikt/ds-react";
import { useRef, useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { MediaInfoDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { editFileTextOnProduct, mapImagesAndPDFfromMedia } from "utils/product-util";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { useErrorStore } from "utils/store/useErrorStore";
import { HM_REGISTER_URL } from "environments";
import { useDeleteFileFromProduct } from "api/ProductApi";
import { uriForMediaFile } from "utils/file-util";

interface Props {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const DocumentsTab = ({ products, mutateProducts, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { pdfs } = mapImagesAndPDFfromMedia(products);
  const { setGlobalError } = useErrorStore();
  const deleteFile = useDeleteFileFromProduct(products[0].id);

  const allPdfsSorted = pdfs.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;

    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  const handleEditFileName = async (uri: string, editedText: string) => {
    const oid = products[0].id;
    //Fetch latest version of product
    let res = await fetch(`${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${oid}`, {
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
    const editedProductDTO = editFileTextOnProduct(productToUpdate, editedText, uri);

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
    mutateProducts();
  };

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={products[0].id}
        fileType="documents"
        mutateProducts={mutateProducts}
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
                    handleDeleteFile={(fileURI) => {
                      deleteFile(fileURI).then(mutateProducts);
                    }}
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
  const [editedFileText, setEditedFileText] = useState(file.filename || "");
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
