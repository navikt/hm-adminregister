import { Heading, HStack, Loader, VStack } from '@navikt/ds-react'
import useSWR from 'swr'
import { useParams } from 'react-router-dom'
import ProductVariantForm from './ProductVariantForm'
import { ProductRegistrationDTO } from 'utils/response-types'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useHydratedErrorStore } from 'utils/store/useErrorStore'
import { fetcherGET } from 'utils/swr-hooks'
import { HM_REGISTER_URL } from 'environments'

const RedigerProduktVariant = () => {
  const { loggedInUser } = useAuthStore()
  const { setGlobalError } = useHydratedErrorStore()

  const { productId } = useParams()

  const registrationsPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/${productId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/${productId}`

  const { data: product, error, isLoading, mutate } =
    useSWR<ProductRegistrationDTO>(loggedInUser ? registrationsPath : null, fetcherGET)

  if (error) {
    setGlobalError(error.status, error.message)
  }

  if (isLoading || !product) {
    return (
      <VStack gap='8'>
        <Loader />
      </VStack>
    )
  }

  return (
    <main>
      <HStack justify='center'>
        <VStack gap='8' className='spacing-bottom--xlarge'>
          <Heading level='1' size='large' align='start'>
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
