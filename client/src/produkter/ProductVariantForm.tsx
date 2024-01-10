import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, HStack, TextField } from '@navikt/ds-react'
import classNames from 'classnames'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { productVariantSchema } from '../utils/zodSchema/newProduct'
import { ProductRegistrationDTO } from '../utils/response-types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isUUID, labelRequired } from '../utils/string-util'

type FormData = z.infer<typeof productVariantSchema>

const ProductVariantForm = ({
                              product,
                              registrationPath,
                              mutate,
                              firstTime,
                            }: {
  product: ProductRegistrationDTO
  registrationPath: string
  mutate: () => void
  firstTime: boolean
}) => {
  const navigate = useNavigate()
  const {
    articleName,
    supplierRef,
    productData: { techData },
  } = product
  const [error, setError] = useState<Error | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isValid },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(productVariantSchema),
    mode: 'onChange',
    defaultValues: {
      articleName,
      supplierRef: isUUID(supplierRef) ? '' : supplierRef,
      techData: product.productData.techData,
    },
  })

  const { fields: techDataFields, append, remove } = useFieldArray({ name: 'techData', control })

  const isSubmittable = !!isValid

  async function onSubmit(data: FormData) {
    const productRegistrationUpdated = JSON.stringify({
      ...product,
      articleName: firstTime ? product.articleName : data.articleName,
      supplierRef: firstTime ? product.supplierRef : data.supplierRef,
      hmsArtNr: data.hmsArtNr,
      productData: {
        ...product.productData,
        techData: data.techData,
      },
    })

    try {
      const setProductVariantResponse = await fetch(registrationPath, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: productRegistrationUpdated,
      })

      if (!setProductVariantResponse.ok) {
        throw Error(setProductVariantResponse.statusText)
      }

      if (setProductVariantResponse.ok) {
        mutate()
        navigate(`/produkter/${product.seriesId}?tab=variants&page=${page}`)
      }
    } catch (e: any) {
      setError(e)
    }
  }

  // if (isSubmitting) {
  //   return <Loader size="large" />
  // }

  return (
    <form className='form form--max-width-small' onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('articleName', { required: true })}
        label={labelRequired('Artikkelnavn')}
        id='articleName'
        name='articleName'
        type='text'
        readOnly={firstTime}
        className={classNames({ readonly: firstTime })}
        defaultValue={product.articleName}
        // onBlur={() => setBlurredField(true)}
        // onFocus={() => setBlurredField(false)}
        error={errors?.articleName?.message}
      />
      <TextField
        {...register('supplierRef', { required: true })}
        label={labelRequired('Leverandør artikkelnummer')}
        id='supplierRef'
        name='supplierRef'
        type='text'
        readOnly={firstTime}
        className={classNames({ readonly: firstTime })}
        error={errors?.supplierRef?.message}
      />
      <TextField
        {...register('hmsArtNr')}
        label={'HMS nummer'}
        id='hmsArtNr'
        name='hmsArtNr'
        type='text'
        error={errors?.hmsArtNr?.message}
      />
      {techDataFields.length > 0 && (
        <Alert variant='info'>
          {firstTime
            ? `Teknisk data opprettet basert på isokategori ${product.isoCategory} satt på produktet`
            : 'Teknisk data hentet inn fra tidligere opprettet artikkel.'}
        </Alert>
      )}
      {techDataFields.map((key, index) => {
        const errorForField = errors?.techData?.[index]?.value
        return (
          <HStack key={`techdata-${key.key}-${index}`} align='end' gap='2'>
            <TextField
              {...register(`techData.${index}.value`, { required: false })}
              label={labelRequired(`${key.key}`)}
              id={`techData.${index}.value`}
              name={`techData.${index}.value`}
              type='text'
              error={errorForField?.message}
            />
            {
              <input
                {...register(`techData.${index}.unit`, { required: false })}
                readOnly
                className='readonly'
                id={`techData.${index}.unit`}
                name={`techData.${index}.unit`}
                // error={errorForField}
              />
            }
          </HStack>
        )
      })}
      <div className='button-container'>
        <Button type='reset' variant='tertiary' size='medium' onClick={() => window.history.back()}>
          {firstTime ? 'Hopp over' : 'Avbryt'}
        </Button>
        <Button type='submit' size='medium' disabled={!isSubmittable}>
          Lagre
        </Button>
      </div>
      {error?.name && (
        <p>
          <span className='auth-dialog-box__erorr-message'>{error?.message}</span>
        </p>
      )}
    </form>
  )
}

export default ProductVariantForm
