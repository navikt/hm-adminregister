import {
  Alert,
  BodyShort,
  Box,
  Button,
  Checkbox,
  Heading,
  HGrid,
  HStack,
  Loader,
  Table,
  VStack,
} from "@navikt/ds-react";
import { useNavigate, useParams } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm";
import { useProductByProductId } from "utils/swr-hooks";
import FormBox from "felleskomponenter/FormBox";
import ErrorAlert from "error/ErrorAlert";
import { useProductVariantsByProductIds } from "api/ProductApi";
import { PlusCircleIcon, SandboxIcon, TrashIcon } from "@navikt/aksel-icons";
import React from "react";
import NewWorksWithProductOnProductModal from "products/variants/NewWorksWithProductOnProductModal";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import ConfirmModal from "felleskomponenter/ConfirmModal";
import { removeWorksWithVariant } from "api/WorksWithApi";
import { WorksWithMapping } from "utils/types/response-types";

const EditWorksWith = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { product, isLoading, mutate, error } = useProductByProductId(productId!);

  const { products } = useProductVariantsByProductIds(product?.productData.attributes.worksWith?.productIds);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [productIdToDelete, setProductIdToDelete] = React.useState<string | null>(null);

  const removeWorksWith = () => {
    if (productIdToDelete && productId) {
      const worksWithMappingToDelete: WorksWithMapping = {
        sourceProductId: productId,
        targetProductId: productIdToDelete,
      };
      removeWorksWithVariant(worksWithMappingToDelete).then((r) => {
        mutate();
        setIsDeleteModalOpen(false);
      });
    }
  };

  if (error) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  if (isLoading || !product) {
    return (
      <VStack gap="8">
        <Loader />
      </VStack>
    );
  }

  return (
    <>
      <NewWorksWithProductOnProductModal
        productId={product.id}
        modalIsOpen={isModalOpen}
        setModalIsOpen={setIsModalOpen}
        mutateProduct={mutate}
      />
      <ConfirmModal
        title="Slett kobling"
        confirmButtonText="Slett"
        text={`Er du sikker på at du vil fjerne koblingen?`}
        onClick={removeWorksWith}
        onClose={() => setIsDeleteModalOpen(false)}
        isModalOpen={isDeleteModalOpen}
      />
      <VStack align="center" gap="8">
        <Box
          background="surface-default"
          marginBlock="14"
          padding="8"
          paddingInline="20"
          borderRadius="large"
          shadow="medium"
          minWidth="800px"
        >
          <VStack gap="8">
            <VStack align="center" gap="4">
              <SandboxIcon title="a11y-title" fontSize="1.5rem" width={43} height={43} />
              <Heading level="1" size="medium" align="center">
                Andre produkter som fungerer sammen med dette produktet
              </Heading>
            </VStack>
            <Button
              className="fit-content"
              variant="primary"
              icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              Legg til kobling
            </Button>

            {!products || products.length === 0 ? (
              <Alert variant="info">Ingen produkter er koblet til dette produktet.</Alert>
            ) : (
              <RowBoxTable size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Variantnavn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">HMS-artnr.</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Artlevnr.</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Fjern</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {products?.map((product) => (
                    <Table.Row key={product.id}>
                      <Table.DataCell>{product.articleName}</Table.DataCell>
                      <Table.DataCell>{product.hmsArtNr}</Table.DataCell>
                      <Table.DataCell>{product.supplierRef}</Table.DataCell>
                      <Table.DataCell>
                        <Button
                          icon={<TrashIcon />}
                          onClick={() => {
                            setProductIdToDelete(product.id);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </RowBoxTable>
            )}

            <HStack gap="4">
              <Button
                type="reset"
                variant="secondary"
                size="medium"
                onClick={() => navigate(`/produkter/${product?.seriesUUID}?tab=variants`)}
              >
                Tilbake
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </>
  );
};

export default EditWorksWith;
