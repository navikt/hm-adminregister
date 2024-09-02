import { Loader, VStack } from "@navikt/ds-react";
import { useParams } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm";
import { useProductByProductId } from "utils/swr-hooks";
import FormBox from "felleskomponenter/FormBox";
import ErrorAlert from "error/ErrorAlert";

const EditProductVariant = () => {
  const { productId } = useParams();

  const { product, isLoading, mutate, error } = useProductByProductId(productId!);

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
    <FormBox title="Egenskaper">
      <VStack gap="8">
        <ProductVariantForm product={product} mutate={mutate} />
      </VStack>
    </FormBox>
  );
};

export default EditProductVariant;
