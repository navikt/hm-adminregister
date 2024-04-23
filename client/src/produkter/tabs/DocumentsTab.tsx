import { FilePdfIcon, PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, HStack, Heading, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { getEditedProductDTORemoveMedia, mapImagesAndPDFfromMedia } from "utils/product-util";
import { useErrorStore } from "utils/store/useErrorStore";
import { MoreMenu } from "felleskomponenter/MoreMenu";
import { HM_REGISTER_URL } from "environments";

interface Props {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const documentType = ["brochure", "manual", "other"] as const;

export type DocumentType = (typeof documentType)[number];

const DocumentsTab = ({ products, mutateProducts, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { pdfs } = mapImagesAndPDFfromMedia(products);
  const { setGlobalError } = useErrorStore();
  const [documentType, setDocumentType] = useState<DocumentType>("other");

  const allPdfsSorted = pdfs.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;

    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  const manualPdfs = allPdfsSorted.filter((pdf) => pdf.text?.trim().toLowerCase() === "bruksanvisning");
  const brochurePdfs = allPdfsSorted.filter((pdf) => pdf.text?.trim().toLowerCase() === "brosjyre");
  const otherPdfs = allPdfsSorted.filter(
    (pdf) => pdf.text?.trim().toLowerCase() !== "brosjyre" && pdf.text?.trim().toLowerCase() !== "bruksanvisning",
  );

  //Dra ut denne i en felles funksjon
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
    const editedProductDTO = getEditedProductDTORemoveMedia(productToUpdate, uri);

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
        documentType={documentType}
      />
      <Tabs.Panel value="documents" className="tab-panel">
        <VStack gap="10">
          {allPdfsSorted.length === 0 && (
            <Alert variant={showInputError ? "error" : "info"}>
              Produktet har ingen dokumenter, her kan man for eksempel legge med brosjyre eller bruksanvisning til
              produktet.
            </Alert>
          )}

          <VStack gap="10">
            <VStack gap="1" className="documents-conatainer">
              <Heading level="2" size="medium">
                Brosjyr(er)
              </Heading>
              {brochurePdfs.length > 0 && (
                <VStack as="ol" gap="3" className="document-list-container">
                  {brochurePdfs.map((brochure) => (
                    <HStack as="li" justify="space-between" align="center" key={brochure.uri}>
                      <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                        <FilePdfIcon fontSize="2rem" />
                        <a href={brochure.sourceUri} target="_blank" rel="noreferrer">
                          {brochure.text || brochure.uri.split("/").pop()}
                        </a>
                      </HStack>
                      {isEditable && (
                        <MoreMenu mediaInfo={brochure} handleDeleteFile={handleDeleteFile} fileType="document" />
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}

              {isEditable && (
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PlusCircleIcon title={"Legg til brosjyre"} fontSize="1.5rem" />}
                  onClick={() => {
                    setDocumentType("brochure");
                    setModalIsOpen(true);
                  }}
                >
                  Legg til brosjyre
                </Button>
              )}
            </VStack>

            <VStack gap="1" className="documents-conatainer">
              <Heading level="2" size="medium">
                Bruksanvisning(er)
              </Heading>
              {manualPdfs.length > 0 && (
                <VStack as="ol" gap="3" className="document-list-container">
                  {manualPdfs.map((manual) => (
                    <HStack as="li" justify="space-between" align="center" key={manual.uri}>
                      <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                        <FilePdfIcon fontSize="2rem" />
                        <a href={manual.sourceUri} target="_blank" rel="noreferrer">
                          {manual.text || manual.uri.split("/").pop()}
                        </a>
                      </HStack>
                      {isEditable && (
                        <MoreMenu mediaInfo={manual} handleDeleteFile={handleDeleteFile} fileType="document" />
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}

              {isEditable && (
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PlusCircleIcon title={"Legg til bruksanvisning"} fontSize="1.5rem" />}
                  onClick={() => {
                    setDocumentType("manual");
                    setModalIsOpen(true);
                  }}
                >
                  {"Legg til bruksanvisning"}
                </Button>
              )}
            </VStack>

            <VStack gap="1" className="documents-conatainer">
              <Heading level="2" size="medium">
                Andre dokumenter
              </Heading>
              {otherPdfs.length > 0 && (
                <VStack as="ol" gap="3" className="document-list-container">
                  {otherPdfs.map((pdf) => (
                    <HStack as="li" justify="space-between" align="center" key={pdf.uri}>
                      <HStack gap={{ xs: "1", sm: "2", md: "3" }} align="center">
                        <FilePdfIcon fontSize="2rem" />
                        <a href={pdf.sourceUri} target="_blank" rel="noreferrer">
                          {pdf.text || pdf.uri.split("/").pop()}
                        </a>
                      </HStack>
                      {isEditable && (
                        <MoreMenu mediaInfo={pdf} handleDeleteFile={handleDeleteFile} fileType="document" />
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}

              {isEditable && (
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<PlusCircleIcon title={"Legg til andre dokument"} fontSize="1.5rem" />}
                  onClick={() => {
                    setDocumentType("other");
                    setModalIsOpen(true);
                  }}
                >
                  {"Legg til andre dokumenter"}
                </Button>
              )}
            </VStack>
          </VStack>
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default DocumentsTab;
