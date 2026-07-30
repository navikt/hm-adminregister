import { useForm } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { draftProductVariantV2 } from 'api/ProductApi'
import { useSeriesV2 } from 'api/SeriesApi'
import FormBox from 'felleskomponenter/FormBox'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useErrorStore } from 'utils/store/useErrorStore'
import { labelRequired } from 'utils/string-util'
import { DraftVariantDTO } from 'utils/types/response-types'
import { newProductVariantSchema } from 'utils/zodSchema/newProduct'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckmarkCircleIcon, LayersIcon, XMarkOctagonIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Heading, HStack, List, ReadMore, TextField, VStack } from '@navikt/ds-react'

type FormData = z.infer<typeof newProductVariantSchema>

const CreateProductVariant = () => {
  const { loggedInUser } = useAuthStore()
  const { setGlobalError } = useErrorStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { seriesId } = useParams()

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(newProductVariantSchema),
    mode: 'onSubmit',
  })

  const { data: series } = useSeriesV2(seriesId!)

  const hasTechData = series?.isoCategory || false

  async function onSubmit(data: FormData) {
    const newVariant: DraftVariantDTO = {
      articleName: data.articleName,
      supplierRef: data.supplierRef,
    }

    draftProductVariantV2(loggedInUser?.isAdmin || false, seriesId!, newVariant)
      .then((product) => {
        const hasTechData = product.productData.techData.length > 0
        if (hasTechData) {
          navigate(`/produkter/${seriesId}/rediger-variant/${product.id}?page=${Number(searchParams.get('page'))}`)
        } else {
          navigate(`/produkter/${seriesId}?tab=variants&page=${Number(searchParams.get('page'))}`)
        }
      })
      .catch((error) => {
        if (error.message === 'supplierIdRefId already exists') {
          setError('supplierRef', { type: 'custom', message: 'Artikkelnummeret finnes allerede på en annen variant' })
        } else {
          setGlobalError(error.status, error.message)
        }
      })
  }

  return (
    <FormBox title="Legg til variant" icon={<LayersIcon />}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="space-16">
          <VariantNameRequirementBox />
          <TextField
            {...register('articleName', { required: true })}
            label={labelRequired('Variantnavn')}
            id="articleName"
            name="articleName"
            type="text"
            error={errors?.articleName?.message}
          />
          <TextField
            {...register('supplierRef', { required: true })}
            label={labelRequired('Leverandør artikkelnummer')}
            id="supplierRef"
            name="supplierRef"
            type="text"
            error={errors?.supplierRef?.message}
          />
          <HStack gap="space-16">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>
            <Button type="submit" size="medium" disabled={isSubmitting}>
              {hasTechData ? 'Opprett og legg til mer info' : 'Opprett'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox>
  )
}

export default CreateProductVariant

// TODO: Innholdet under er en midlertidig plassholder og må utarbeides i samarbeid med fagpersoner.
const VariantNameRequirementBox = () => (
  <Alert variant="info">
    <Heading size="small" level="2">
      Tips til gode variantnavn:
    </Heading>
    <BodyLong weight="semibold" textColor= "subtle" >
      (disse er bare forslag og vil bli endret i dialog med IHT)
    </BodyLong>
    <BodyLong>- er kort og presist</BodyLong>
    <BodyLong><em>- unngå å gjenta produktnavnet eller må vi ha produktnavn med slik at man kan kjenne til produktet/serien denne varianten tilhører til?</em></BodyLong>
    <BodyLong>- beskriver det som skiller varianten fra andre varianter i serien</BodyLong>
    <BodyLong>- unngå å ha egenskaper som størrelse eller andre mål i variantnavnet.....</BodyLong>
    <ReadMore header="Se eksempler på gode og dårlige variantnavn">
      <VStack gap="space-16">
        <VStack gap="space-4">
          <HStack gap="space-8" align="center">
            <CheckmarkCircleIcon aria-hidden fontSize="1.25rem" color="var(--ax-text-success-subtle)" />
            <BodyLong weight="semibold">Gode eksempler</BodyLong>
          </HStack>
          <List>
            <List.Item>???</List.Item>
            <List.Item>???</List.Item>
          </List>
        </VStack>

        <VStack gap="space-4">
          <HStack gap="space-8" align="center">
            <XMarkOctagonIcon aria-hidden fontSize="1.25rem" color="var(--ax-text-danger-subtle)" />
            <BodyLong weight="semibold">Unngå</BodyLong>
          </HStack>
          <List>
            <List.Item>
              <a
                href="https://finnhjelpemiddel.nav.no/produkt/fcce027c-af6e-4bbf-8e58-61cb27247e20"
                target="_blank"
                rel="noreferrer"
              >
                Netti III HD 2016
              </a>
            </List.Item>
            <List.Item>
              <a
                href="https://finnhjelpemiddel.nav.no/produkt/eb687083-b549-435f-9628-a08e950e8d10?term=FlexiElectric"
                target="_blank"
                rel="noreferrer"
              >
                FlexiElectric
              </a>
            </List.Item>
          </List>
        </VStack>
      </VStack>
    </ReadMore>
  </Alert>
)
