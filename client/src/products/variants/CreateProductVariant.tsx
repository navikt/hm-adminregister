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
import { LayersIcon } from '@navikt/aksel-icons'
import { Button, HStack, TextField, VStack } from '@navikt/ds-react'

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
