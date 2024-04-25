import { PlusCircleIcon } from "@navikt/aksel-icons";
import { Alert, Button, Tabs, VStack } from "@navikt/ds-react";
import { useState } from "react";
import "../product-page.scss";
import UploadModal from "./UploadModal";
import { ProductRegistrationDTO } from "utils/types/response-types";
import { mapImagesAndPDFfromMedia } from "utils/product-util";
import { ImageCard } from "felleskomponenter/ImageCard";
import { useDeleteFileFromProduct } from "api/ProductApi";

interface Props {
  products: ProductRegistrationDTO[];
  mutateProducts: () => void;
  isEditable: boolean;
  showInputError: boolean;
}

const ImagesTab = ({ products, mutateProducts, isEditable, showInputError }: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { images } = mapImagesAndPDFfromMedia(products);
  const deleteFile = useDeleteFileFromProduct(products[0].id);

  const sortedImages = images.sort((a, b) => {
    const dateA = a.updated ? new Date(a.updated).getTime() : 0;
    const dateB = b.updated ? new Date(b.updated).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <>
      <UploadModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        oid={products[0].id}
        fileType="images"
        mutateProducts={mutateProducts}
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
                    handleDeleteFile={(fileURI) => {
                      deleteFile(fileURI).then(mutateProducts);
                    }}
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
