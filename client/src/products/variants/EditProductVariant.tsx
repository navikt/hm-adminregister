import { Alert, Heading, HGrid, HStack, Loader, VStack } from "@navikt/ds-react";
import { useParams } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm";
import { useProductByProductId } from "utils/swr-hooks";

const EditProductVariant = () => {
  const { productId } = useParams();

  const { product, isLoading, mutate, error } = useProductByProductId(productId!);

  if (error) {
    return (
      <main className="show-menu">
        <HGrid gap="12" columns="minmax(16rem, 55rem)">
          <Alert variant="error">
            Kunne ikke vise produktvariant. Prøv å laste siden på nytt, eller gå tilbake. Hvis problemet vedvarer, kan
            du sende oss en e-post{" "}
            <a href="mailto:digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no">
              digitalisering.av.hjelpemidler.og.tilrettelegging@nav.no
            </a>
          </Alert>
        </HGrid>
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
    <main>
      <HStack justify="center">
        <VStack gap="8" className="spacing-bottom--xlarge">
          <Heading level="1" size="large" align="start">
            Egenskaper
          </Heading>
          <ProductVariantForm product={product} mutate={mutate} />
        </VStack>
      </HStack>
    </main>
  );
};

export default EditProductVariant;
