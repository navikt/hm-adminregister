import { Alert, Box, Button, Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { SandboxIcon } from "@navikt/aksel-icons";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductByProductId } from "utils/swr-hooks";
import { useProductVariantsByProductIds } from "api/ProductApi";
import WorksWithVariantsTable from "./WorksWithVariantsTable";
import ErrorAlert from "error/ErrorAlert";

const ViewWorksWith = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { product, isLoading, error } = useProductByProductId(productId!);
  const { products } = useProductVariantsByProductIds(product?.productData.attributes.worksWith?.productIds);

  if (error) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  if (isLoading || !product) {
    return (
      <VStack gap="space-8">
        <Loader />
      </VStack>
    );
  }

  return (
    <VStack align="center" gap="space-8">
      <Box
        background="default"
        marginBlock="space-16"
        padding="space-8"
        paddingInline="space-20"
        borderRadius="8"
        shadow="dialog"
        minWidth="800px"
      >
        <VStack gap="space-8">
          <VStack align="center" gap="space-4">
            <SandboxIcon title="a11y-title" fontSize="1.5rem" width={43} height={43} />
            <Heading level="1" size="medium" align="center">
              Andre hjelpemidler som fungerer sammen med dette hjelpemiddelet
            </Heading>
          </VStack>
          {!products || products.length === 0 ? (
            <Alert variant="info">Ingen produkter er koblet til dette produktet.</Alert>
          ) : (
            <WorksWithVariantsTable products={products} showRemove={false} />
          )}
          <HStack gap="space-4">
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
  );
};

export default ViewWorksWith;
