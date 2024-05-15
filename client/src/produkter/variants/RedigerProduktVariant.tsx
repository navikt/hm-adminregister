import { Heading, HStack, Loader, VStack } from "@navikt/ds-react";
import { useParams } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm";
import { useProductByProductId } from "utils/swr-hooks";

const RedigerProduktVariant = () => {
  const { productId } = useParams();

  const { product, isLoading, mutate } = useProductByProductId(productId!);

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

export default RedigerProduktVariant;
