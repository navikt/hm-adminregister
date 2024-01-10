import React from 'react'

import useSWR from 'swr'

import { Alert, Button, Heading, HGrid, Label, Loader, Tabs, VStack } from '@navikt/ds-react'

import { EyeClosedIcon } from '@navikt/aksel-icons'
import './product-page.scss'
import { FormProvider, useForm } from 'react-hook-form'
import AboutTab from './AboutTab'
import VariantsTab from './VariantsTab'
import FileTab from './FileTab'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useHydratedAuthStore } from '../utils/store/useAuthStore'
import { useHydratedErrorStore } from '../utils/store/useErrorStore'
import { IsoCategoryDTO, ProductRegistrationDTO } from '../utils/response-types'
import { fetcherGET } from '../utils/swr-hooks'
import StatusTag from '../components/StatusTag'
import { HM_REGISTER_URL } from '../environments'
import { updateProduct } from '../api/ProductApi'

export type EditCommonInfoProduct = {
  description: string
  isoCode: string
}

const ProductPage = () => {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const activeTab = searchParams.get('tab')

  const { seriesId } = useParams()

  const navigate = useNavigate()

  const { loggedInUser } = useHydratedAuthStore()
  const { setGlobalError } = useHydratedErrorStore()
  const seriesIdPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/product/registrations/series/${seriesId}`

  const {
    data: products,
    error,
    isLoading,
    mutate: mutateProducts,
  } = useSWR<ProductRegistrationDTO[]>(loggedInUser ? seriesIdPath : null, fetcherGET)

  const {
    data: isoCategory,
    error: isoError,
    isLoading: isoIsLoading,
  } = useSWR<IsoCategoryDTO>(
    products && products[0].isoCategory && products[0].isoCategory !== '0'
      ? `${HM_REGISTER_URL}/admreg/api/v1/isocategories/${products[0].isoCategory}`
      : null,
    fetcherGET,
  )

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`)
  }

  const formMethods = useForm<EditCommonInfoProduct>()

  async function onSubmit(data: EditCommonInfoProduct) {
    updateProduct(products!![0].id, data).then(
      (product) =>
        mutateProducts(),
    ).catch((error) => {
      setGlobalError(error.status, error.message)
    })
  }


  if (error) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        Error
      </HGrid>
    )
  }

  if (isLoading) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        <Loader size='large' />
      </HGrid>
    )
  }

  if (!products || products.length === 0) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        <Alert variant='info'>Ingen data funnet.</Alert>
      </HGrid>
    )
  }

  const isDraft = products[0].draftStatus === 'DRAFT'
  const isPending = products[0].adminStatus === 'PENDING'

  return (
    <main className='show-menu'>
      <FormProvider {...formMethods}>
        <HGrid gap='12' columns={{ xs: 1, sm: 'minmax(16rem, 55rem) 200px' }} className='product-page'>
          <VStack gap={{ xs: '4', md: '8' }}>
            <VStack gap='1'>
              <Label>Produktnavn</Label>
              <Heading level='1' size='xlarge'>
                {products[0].title ?? products[0].title}
              </Heading>
            </VStack>
            <Tabs defaultValue={activeTab || 'about'} onChange={updateUrlOnTabChange}>
              <Tabs.List>
                <Tabs.Tab value='about' label='Om produktet' />
                <Tabs.Tab value='images' label='Bilder' />
                <Tabs.Tab value='documents' label='Dokumenter' />
                <Tabs.Tab value='variants' label='Teknisk data / artikler' />
              </Tabs.List>
              <AboutTab product={products[0]} onSubmit={onSubmit} isoCategory={isoCategory} />
              <FileTab products={products} mutateProducts={mutateProducts} fileType='images' />
              <FileTab products={products} mutateProducts={mutateProducts} fileType='documents' />
              <VariantsTab products={products} />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: '2', md: '4' }}>
            <Heading level='1' size='medium'>
              Status
            </Heading>
            <StatusTag isPending={isPending} isDraft={isDraft} />
            <PublishButton isAdmin={loggedInUser?.isAdmin || false} isPending={isPending}
                           isDraft={isDraft} />
            <Button variant='secondary' disabled={isDraft}
                    icon={<EyeClosedIcon aria-hidden fontSize={'1.5rem'} />}>
              Avpubliser
            </Button>
          </VStack>
        </HGrid>
      </FormProvider>
    </main>
  )
}
export default ProductPage

const PublishButton = ({ isAdmin, isPending, isDraft }: { isAdmin: boolean; isPending: boolean; isDraft: boolean }) => {
  if (isDraft) {
    return (
      <Button style={{ marginTop: '20px' }} disabled={isAdmin}>
        Send til godkjenning
      </Button>
    )
  } else if (isAdmin && isPending) {
    return <Button style={{ marginTop: '20px' }}>Publiser</Button>
  } else if (!isAdmin && isPending) {
    return (
      <Button style={{ marginTop: '20px' }} disabled={true}>
        Send til godkjenning
      </Button>
    )
  } else {
    return (
      <Button style={{ marginTop: '20px' }} disabled={true}>
        Publiser
      </Button>
    )
  }
}
