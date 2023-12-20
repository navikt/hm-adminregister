import React from 'react'

import useSWR from 'swr'

import { Alert, Button, HGrid, Heading, Label, Loader, Tabs, VStack } from '@navikt/ds-react'

import { EyeClosedIcon } from '@navikt/aksel-icons'
import './product-page.scss'
import { FormProvider, useForm } from 'react-hook-form'
import AboutTab from './AboutTab'
import VariantsTab from './VariantsTab'
import FileTab from './FileTab'
import { useSearchParams } from "react-router-dom";
import { useHydratedAuthStore } from "../../utils/store/useAuthStore";
import { useHydratedErrorStore } from "../../utils/store/useErrorStore";
import { AgreementInfoDTO, IsoCategoryDTO, ProductRegistrationDTO } from "../../utils/response-types";
import { CustomError, fetcherGET } from "../../utils/swr-hooks";
import { mapImagesAndPDFfromMedia } from "../../utils/product-util";
import StatusTag from "../../components/StatusTag";
import DefinitionList from '../../components/definition-list/DefinitionList'

export type EditCommonInfoProduct = {
  description: string
  isoCode: string
}

const ProductPage = ({ params: { id: seriesId } }: { params: { id: string } }) => {
  const [searchParams] = useSearchParams()
  const pathname = window.location.pathname
  const activeTab = searchParams.get('tab')

  const { loggedInUser } = useHydratedAuthStore()
  const { setGlobalError } = useHydratedErrorStore()
  const seriesIdPath = loggedInUser?.isAdmin
    ? `/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `/admreg/vendor/api/v1/product/registrations/series/${seriesId}`

  const {
    data: products,
    error,
    isLoading,
    mutate: mutateProducts,
  } = useSWR<ProductRegistrationDTO[]>(seriesIdPath, fetcherGET)

  const {
    data: isoCategory,
    error: isoError,
    isLoading: isoIsLoading,
  } = useSWR<IsoCategoryDTO>(
    products && products[0].isoCategory && products[0].isoCategory !== '0'
      ? `/admreg/api/v1/isocategories/${products[0].isoCategory}`
      : null,
    fetcherGET
  )

  const updateUrlOnTabChange = (value: string) => {
    window.history.replaceState(null, '', `/adminregister${pathname}?tab=${value}`)
  }

  const formMethods = useForm<EditCommonInfoProduct>()

  async function onSubmit(data: EditCommonInfoProduct) {
    //Need to fetch latest version
    const productToUpdate: ProductRegistrationDTO = await fetch(
      `/admreg/vendor/api/v1/product/registrations/${products && products[0].id}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => {
      if (!res.ok) {
        return res.json().then((data) => {
          throw new CustomError(data.errorMessage || res.statusText, res.status)
        })
      }
      return res.json()
    })

    //Iso can be undefined when not chosen from the combobox
    const isoCode = data.isoCode ? data.isoCode : productToUpdate.isoCategory
    const description = data.description
      ? data.description
      : productToUpdate.productData.attributes.text
        ? productToUpdate.productData.attributes.text
        : ''

    const editedProductDTO = getEditedProductDTO(productToUpdate, isoCode, description)

    const response = await fetch(`/admreg/vendor/api/v1/product/registrations/${productToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(editedProductDTO),
    })

    if (response.ok) {
      mutateProducts()
    } else {
      const responsData = await response.json()
      setGlobalError(response.status, responsData.message)
    }
  }

  if (error) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        Error
      </HGrid>
    )
  }

  if (isLoading) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    )
  }

  if (!products || products.length === 0) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Alert variant="info">Ingen data funnet.</Alert>
      </HGrid>
    )
  }

  const { images, pdfs } = mapImagesAndPDFfromMedia(products)
  const isDraft = products[0].draftStatus === 'DRAFT'
  const isPending = products[0].adminStatus === 'PENDING'

  return (
    <FormProvider {...formMethods}>
      <HGrid gap="12" columns={{ xs: 1, sm: 'minmax(16rem, 55rem) 200px' }} className="product-page">
        <VStack gap={{ xs: '4', md: '8' }}>
          <VStack gap="1">
            <Label>Produktnavn</Label>
            <Heading level="1" size="xlarge">
              {products[0].title ?? products[0].title}
            </Heading>
          </VStack>
          <Tabs defaultValue={activeTab || 'about'} onChange={updateUrlOnTabChange}>
            <Tabs.List>
              <Tabs.Tab value="about" label="Om produktet" />
              <Tabs.Tab value="images" label="Bilder" />
              <Tabs.Tab value="documents" label="Dokumenter" />
              <Tabs.Tab value="variants" label="Teknisk data / artikler" />
            </Tabs.List>
            <AboutTab product={products[0]} onSubmit={onSubmit} isoCategory={isoCategory} />
            <FileTab products={products} mutateProducts={mutateProducts} fileType="images" />
            <FileTab products={products} mutateProducts={mutateProducts} fileType="documents" />
            <VariantsTab products={products} />
          </Tabs>
        </VStack>
        <VStack gap={{ xs: '2', md: '4' }}>
          <Heading level="1" size="medium">
            Status
          </Heading>
          <StatusTag isPending={isPending} isDraft={isDraft} />
          <PublishButton isAdmin={loggedInUser?.isAdmin || false} isPending={isPending} isDraft={isDraft} />
          <Button variant="secondary" disabled={isDraft} icon={<EyeClosedIcon aria-hidden fontSize={'1.5rem'} />}>
            Avpubliser
          </Button>
        </VStack>
      </HGrid>
    </FormProvider>
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

const AgreementInfo = ({ agreement }: { agreement: AgreementInfoDTO }) => {
  return (
    <>
      <DefinitionList.Term>Avtale</DefinitionList.Term>
      <DefinitionList.Definition>{agreement.title ?? 'ingen'}</DefinitionList.Definition>
      <DefinitionList.Term>Delkontrakt</DefinitionList.Term>
      <DefinitionList.Definition>
        {agreement.postNr && agreement.postTitle ? `Nr ${agreement.postNr}: ${agreement.postTitle}` : 'ingen'}
      </DefinitionList.Definition>
      <DefinitionList.Term>Rangering</DefinitionList.Term>
      <DefinitionList.Definition>{agreement.rank ? agreement.rank : 'ingen'}</DefinitionList.Definition>
    </>
  )
}

const getEditedProductDTO = (
  productToEdit: ProductRegistrationDTO,
  newIsoCategory: string,
  newDescription: string
): ProductRegistrationDTO => {
  return {
    ...productToEdit,
    isoCategory: newIsoCategory,
    productData: {
      ...productToEdit.productData,
      attributes: {
        ...productToEdit.productData.attributes,
        text: newDescription,
      },
    },
  }
}
