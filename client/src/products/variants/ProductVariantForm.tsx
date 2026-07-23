import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { updateProductVariant } from 'api/ProductApi'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useErrorStore } from 'utils/store/useErrorStore'
import { isUUID, labelRequired, trimValue } from 'utils/string-util'
import { ProductRegistrationDTOV2, TechDataType } from 'utils/types/response-types'

import { Button, HStack, HelpText, Select, TextField, VStack } from '@navikt/ds-react'

import styles from './ProductVariantForm.module.scss'

type FormData = {
  articleName: string
  supplierRef: string
  hmsArtNr: string | null
  techData: Array<{
    key: string
    value: string
    unit: string
    type: TechDataType
    definition?: string | null
    required: boolean
    options?: string[] | null
  }>
}

const ProductVariantForm = ({ product, mutate }: { product: ProductRegistrationDTOV2; mutate: () => void }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { articleName, supplierRef } = product
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const { loggedInUser } = useAuthStore()
  const { setGlobalError } = useErrorStore()

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setError,
    getValues,
    trigger,
    clearErrors,
  } = useForm<FormData>({
    mode: 'onTouched',
    defaultValues: {
      articleName,
      hmsArtNr: product.hmsArtNr,
      supplierRef: isUUID(supplierRef) ? '' : supplierRef,
      techData: product.productData.techData,
    },
  })

  const { fields: techDataFields } = useFieldArray({ name: 'techData', control })

  useEffect(() => {
    trigger('techData')
  }, [trigger])

  async function onSubmit(data: FormData) {
    const productRegistrationUpdated = {
      hmsArtNr: trimValue(data.hmsArtNr),
      articleName: trimValue(data.articleName),
      supplierRef: trimValue(data.supplierRef),
      productData: {
        ...product.productData,
        techData: data.techData.map((field) => ({
          ...field,
          value: trimValue(field.value),
        })),
      },
    }
    updateProductVariant(loggedInUser?.isAdmin || false, product.id, productRegistrationUpdated)
      .then((product) => {
        navigate(`/produkter/${product.seriesUUID}?tab=variants&page=${page}`, { state: state })
        mutate()
      })
      .catch((error) => {
        if (error.message === 'supplierIdRefId already exists') {
          setError('supplierRef', { type: 'custom', message: 'Artikkelnummeret finnes allerede på en annen variant' })
        } else {
          setGlobalError(error.status, error.message)
        }
      })
  }

  const handleSaveWithMissingData = () => {
    clearErrors()
    const data = getValues()
    onSubmit(data)
  }

  const hasRequiredFieldErrors = techDataFields.some((field, index) => {
    if (!field.required) return false
    return !!errors?.techData?.[index]?.value
  })

  return (
    <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
      <VStack gap="space-12">
        <TextField
          {...register('articleName', { required: true })}
          label={labelRequired('Artikkelnavn')}
          id="articleName"
          name="articleName"
          type="text"
          defaultValue={product.articleName}
          error={errors?.articleName && 'Artikkelnavn er påkrevd'}
        />
        <TextField
          {...register('supplierRef', { required: true })}
          label={labelRequired('Leverandør artikkelnummer')}
          id="supplierRef"
          name="supplierRef"
          type="text"
          error={errors?.supplierRef?.message || (errors?.supplierRef && 'Artikkelnummer er påkrevd')}
          readOnly={!loggedInUser?.isAdmin && product.isPublished}
        />
        {loggedInUser?.isAdmin && (
          <TextField
            {...register('hmsArtNr')}
            label={'HMS nummer'}
            id="hmsArtNr"
            name="hmsArtNr"
            type="text"
            error={errors?.hmsArtNr?.message}
          />
        )}
        {techDataFields.map((techDataField, index) => {
          const errorForField = errors?.techData?.[index]?.value
          const isRequired = techDataField.required
          const baseLabel = isRequired ? labelRequired(techDataField.key) : techDataField.key

          const label = techDataField?.definition ? (
            <HStack gap="space-16">
              {baseLabel} <HelpText>{techDataField?.definition}</HelpText>{' '}
            </HStack>
          ) : (
            baseLabel
          )

          return (
            <HStack key={`techdata-${techDataField.key}-${index}`} align="end" gap="space-8" wrap={false}>
              {techDataField.type === 'NUMBER' && (
                <TextField
                  {...register(`techData.${index}.value`, {
                    required: isRequired ? `${techDataField.key} er påkrevd` : false,
                    validate: (value) => {
                      if (!value?.trim()) {
                        return isRequired ? `${techDataField.key} er påkrevd` : true
                      }
                      return /^\d+([.,]\d+)?$/.test(value.trim()) || 'Må være tall'
                    },
                  })}
                  label={label}
                  id={`techData.${index}.value`}
                  name={`techData.${index}.value`}
                  type="text"
                  error={errorForField?.message}
                />
              )}
              {techDataField.type === 'BOOLEAN' && (
                <Select
                  {...register(`techData.${index}.value`, {
                    required: isRequired ? `${techDataField.key} er påkrevd` : false,
                    validate: (value) => {
                      if (isRequired && !value) return `${techDataField.key} er påkrevd`
                      return true
                    },
                  })}
                  label={label}
                  error={errorForField?.message}
                >
                  <option value="">Velg</option>
                  <option value="Ja">Ja</option>
                  <option value="Nei">Nei</option>
                </Select>
              )}
              {techDataField.type === 'OPTIONS' && (
                <Select
                  {...register(`techData.${index}.value`, {
                    required: isRequired ? `${techDataField.key} er påkrevd` : false,
                    validate: (value) => {
                      if (isRequired && !value) return `${techDataField.key} er påkrevd`
                      return true
                    },
                  })}
                  label={label}
                  error={errorForField?.message}
                >
                  <option value="">Velg</option>
                  {techDataField.options?.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              )}
              {techDataField.type === 'TEXT' && (
                <TextField
                  {...register(`techData.${index}.value`, {
                    required: isRequired ? `${techDataField.key} er påkrevd` : false,
                    validate: (value) =>
                      !value || value.trim() ? true : isRequired ? `${techDataField.key} er påkrevd` : true,
                  })}
                  label={label}
                  id={`techData.${index}.value`}
                  name={`techData.${index}.value`}
                  type="text"
                  error={errorForField?.message}
                />
              )}
              <span className={styles.techDataUnit}>{techDataField.unit}</span>
            </HStack>
          )
        })}
        <div className="button-container">
          <Button
            type="reset"
            variant="secondary"
            size="medium"
            onClick={() => navigate(`/produkter/${product.seriesUUID}?tab=variants&page=${page}`, { state: state })}
          >
            Avbryt
          </Button>
          <Button type="submit" size="medium" disabled={hasRequiredFieldErrors}>
            Lagre
          </Button>
          {hasRequiredFieldErrors && (
            <Button type="button" variant="secondary" size="medium" onClick={handleSaveWithMissingData}>
              Lagre med manglende teknisk data
            </Button>
          )}
        </div>
      </VStack>
    </form>
  )
}

export default ProductVariantForm
