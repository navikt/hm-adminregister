import { FilePdfIcon, FloppydiskIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Heading, Tabs, TextField, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { MediaInfoDTO, ProductRegistrationDTO } from "utils/types/response-types";
import { getEditedProductDTOEditedTextOnFile, mapImagesAndPDFfromMedia } from "utils/product-util";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { useErrorStore } from "utils/store/useErrorStore";
import { HM_REGISTER_URL } from "environments";
import { useDeleteFileFromProduct } from "./ImagesTab";

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
    const editedProductDTO = getEditedProductDTOEditedTextOnFile(productToUpdate, editedText, uri);

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
            <Heading level="2" size="medium">
              Dokumenter
            </Heading>
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
  const [editFileNameMode, setEditFileNameMode] = useState(false);

  const handleEditFileName = () => {
    setEditFileNameMode(true);
  };

  const handleSaveFileName = () => {
    setEditFileNameMode(false);
    handleUpdateFileName(file.uri, editedFileText);
  };

  const textLength = editedFileText.length + 4;

  return (
    <>
      <HStack as="li" justify="space-between" align="center">
        {editFileNameMode ? (
          <HStack style={{ width: "100%" }} justify="space-between">
            <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center" wrap={false}>
              <FilePdfIcon fontSize="2rem" />
              <TextField
                className="inputfield"
                style={{ width: `${textLength}ch`, maxWidth: "550px" }}
                label=""
                value={editedFileText}
                onChange={(event) => setEditedFileText(event.currentTarget.value)}
              />
            </HStack>
            <Button
              size="xsmall"
              variant="tertiary"
              onClick={handleSaveFileName}
              icon={<FloppydiskIcon title="Lagre" fontSize="2rem" />}
            >
              Lagre
            </Button>
          </HStack>
        ) : (
          <>
            <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
              <FilePdfIcon fontSize="2rem" />
              <a href={file.sourceUri} target="_blank" rel="noreferrer">
                {file.text || file.uri.split("/").pop()}
              </a>
            </HStack>
            {isEditable && (
              <MoreMenu mediaInfo={file} handleDeleteFile={handleDeleteFile} handleEditFileName={handleEditFileName} />
            )}
          </>
        )}
      </HStack>
    </>
  );
};
