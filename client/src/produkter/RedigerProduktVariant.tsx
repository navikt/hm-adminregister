import { HStack, Heading, Loader, VStack } from '@navikt/ds-react'
import useSWR from 'swr'
import { useParams } from "react-router-dom";
import ProductVariantForm from "./ProductVariantForm";
import { ProductRegistrationDTO } from "../utils/response-types";
import { useHydratedAuthStore } from "../utils/store/useAuthStore";
import { useHydratedErrorStore } from "../utils/store/useErrorStore";
import { fetcherGET } from "../utils/swr-hooks";

const RedigerProduktVariant = () => {
    const { loggedInUser } = useHydratedAuthStore()
    const { setGlobalError } = useHydratedErrorStore()

    const { productId } = useParams()

    const registrationsPath = loggedInUser?.isAdmin
        ? `/admreg/admin/api/v1/product/registrations/${productId}`
        : `/admreg/vendor/api/v1/product/registrations/${productId}`

    const { data: product, error, isLoading, mutate } =
        useSWR<ProductRegistrationDTO>(registrationsPath, fetcherGET)

    if (error) {
        setGlobalError(error.status, error.message)
    }

    if (isLoading || !product) {
        return (
            <VStack gap="8">
                <Loader />
            </VStack>
        )
    }

    return (
        <main>
            <HStack justify="center">
                <VStack gap="8" className="spacing-bottom--xlarge">
                    <Heading level="1" size="large" align="start">
                        Endre artikkelinformasjon
                    </Heading>
                    <ProductVariantForm product={product} registrationPath={registrationsPath} mutate={mutate}
                                        firstTime={false} />
                </VStack>
            </HStack>
        </main>
    )
}

export default RedigerProduktVariant
