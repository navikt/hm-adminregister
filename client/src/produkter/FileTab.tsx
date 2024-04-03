import { FilePdfIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "./product-page.scss";
import UploadModal from "./UploadModal";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { getEditedProductDTORemoveFiles, mapImagesAndPDFfromMedia } from "utils/product-util";
import { useErrorStore } from "utils/store/useErrorStore";
import { ImageCard } from "felleskomponenter/ImageCard";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { HM_REGISTER_URL } from "environments";

interface Props {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  fileType: "images" | "documents";
  showInputError: boolean;
}

const FileTab = ({ products, mutateProducts, fileType, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { images, pdfs } = mapImagesAndPDFfromMedia(products);
  const { setGlobalError } = useErrorStore();

  const sortedImages = images.sort((a, b) => new Date(a.updated).getTime() - new Date(b.updated).getTime());
  const sortedPdfs = pdfs.sort((a, b) => new Date(a.updated).getTime() - new Date(b.updated).getTime());

  const handleDeleteFile = async (uri: string) => {
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
    const editedProductDTO = getEditedProductDTORemoveFiles(productToUpdate, uri);

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
        fileType={fileType}
        mutateProducts={mutateProducts}
      />
      <Tabs.Panel value={fileType} className="tab-panel">
        <VStack gap="8">
          {fileType === "images" ? (
            <>
              {sortedImages.length > 0 && (
                <ol className="images">
                  {sortedImages.map((image) => (
                    <ImageCard
                      mediaInfo={image}
                      key={image.uri}
                      handleDeleteFile={handleDeleteFile}
                      showMenuButton={products[0].draftStatus === "DRAFT"}
                    />
                  ))}
                </ol>
              )}
              {sortedImages.length === 0 && (
                <Alert variant={showInputError ? "error" : "info"}>
                  Produktet har ingen dokumenter, her kan man for eksempel legge med brosjyre eller brukermanual.
                </Alert>
              )}
            </>
          ) : (
            <>
              {sortedPdfs.length > 0 && (
                <ol className="documents">
                  {sortedPdfs.map((pdf) => (
                    <li className="document" key={pdf.uri}>
                      <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                        <FilePdfIcon fontSize="2rem" />
                        <a href={pdf.sourceUri} target="_blank" className="document-type" rel="noreferrer">
                          {pdf.text || pdf.uri.split("/").pop()}
                        </a>
                      </HStack>
                      {products[0].draftStatus === "DRAFT" && (
                        <MoreMenu mediaInfo={pdf} handleDeleteFile={handleDeleteFile} fileType="document" />
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {sortedPdfs.length === 0 && (
                <Alert variant={showInputError ? "error" : "info"}>
                  Produktet trenger dokumenter før det kan sendes til godkjenning
                </Alert>
              )}
            </>
          )}
          {products[0].draftStatus === "DRAFT" && (
            <Button
              className="fit-content"
              variant="tertiary"
              icon={
                <PlusCircleIcon
                  title={fileType === "images" ? "Legg til bilde" : "Legg til dokument"}
                  fontSize="1.5rem"
                />
              }
              onClick={() => setModalIsOpen(true)}
            >
              {fileType === "images" ? "  Legg til bilder" : "Legg til dokumenter"}
            </Button>
          )}
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default FileTab;
