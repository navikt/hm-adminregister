import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { getEditedProductDTORemoveMedia, mapImagesAndPDFfromMedia } from "utils/product-util";
import { useErrorStore } from "utils/store/useErrorStore";
import { ImageCard } from "felleskomponenter/ImageCard";
import { HM_REGISTER_URL } from "environments";

interface Props {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const ImagesTab = ({ products, mutateProducts, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { images } = mapImagesAndPDFfromMedia(products);
  const { setGlobalError } = useErrorStore();

  const sortedImages = images.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;
    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  //Denne bør trekkes ut til en felles funksjon. Sjekk hva som finnes fra før.
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
        fileType="images"
        mutateProducts={mutateProducts}
        documentType={"other"}
      />
      <Tabs.Panel value="images" className="tab-panel">
        <VStack gap="8">
          <>
            {sortedImages.length > 0 && (
              <ol className="images">
                {sortedImages.map((image) => (
                  <ImageCard
                    mediaInfo={image}
                    key={image.uri}
                    handleDeleteFile={handleDeleteFile}
                    showMenuButton={isEditable}
                  />
                ))}
              </ol>
            )}
            {sortedImages.length === 0 && (
              <Alert variant={showInputError ? "error" : "info"}>Produktet har ingen bilder</Alert>
            )}
          </>

          {isEditable && (
            <>
              <Button
                className="fit-content"
                variant="tertiary"
                icon={<PlusCircleIcon title="Legg til bilder" fontSize="1.5rem" />}
                onClick={() => {
                  setModalIsOpen(true);
                }}
              >
                Legg til bilder
              </Button>
            </>
          )}
        </VStack>
      </Tabs.Panel>
    </>
  );
};

export default ImagesTab;
