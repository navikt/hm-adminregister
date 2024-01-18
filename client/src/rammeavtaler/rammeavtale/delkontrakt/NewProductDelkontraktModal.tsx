import { Button, HStack, Loader, Modal, TextField, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useHydratedErrorStore } from '../../../utils/store/useErrorStore'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { labelRequired } from '../../../utils/string-util'
import { createNewProductOnDelkontraktSchema } from '../../../utils/zodSchema/newProductOnDelkontrakt'
import { getProduct } from '../../../api/ProductApi'
import { ProductRegistrationDTO } from '../../../utils/response-types'
import { VarianterListe } from './VarianterListe'

interface Props {
  modalIsOpen: boolean
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

export type NewProductDelkontraktFormData = z.infer<typeof createNewProductOnDelkontraktSchema>

const NewProductDelkontraktModal = ({ modalIsOpen, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [product, setProduct] = useState<ProductRegistrationDTO | undefined>(undefined)
  const [seriesId, setSeriesId] = useState<string | undefined>(undefined)

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<NewProductDelkontraktFormData>({
    resolver: zodResolver(createNewProductOnDelkontraktSchema),
    mode: 'onSubmit',
  })
  const { setGlobalError } = useHydratedErrorStore()

  async function onSubmitContinue(data: NewProductDelkontraktFormData) {
    await onSubmit(data)
  }

  async function onSubmitClose(data: NewProductDelkontraktFormData) {
    await onSubmit(data)
    setModalIsOpen(false)
  }

  async function onSubmit(data: NewProductDelkontraktFormData) {
    setIsSaving(true)

    // todo: metode for å legge til produkt på delkontrakt
    reset()
    setIsSaving(false)
  }


  async function onClickGetProduct(data: NewProductDelkontraktFormData) {
    getProduct(data.hmsNummer).then(
      (product) => {
        setProduct(product)
        if (product.seriesId) {
          setSeriesId(product.seriesId)
        }
      },
    ).catch((error) => {
      setGlobalError(error.status, error.message)
    })
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: 'Legg til produkt',
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form>
        <Modal.Body>

          <div
            className='delkontrakter-tab__new-delkontrakt-container'
          >

            <VStack gap={'2'} style={{ width: '100%' }}>
              <TextField
                {...register('hmsNummer', { required: true })}
                label={labelRequired('HMS-nummer')}
                id='hmsNummer'
                name='hmsNummer'
                type='text'
                error={errors?.hmsNummer?.message}
              />
              <Button
                onClick={handleSubmit(onClickGetProduct)}
                type='button'
                variant='secondary'
                style={{ marginLeft: 'auto' }}
              >
                Hent produkt
              </Button>
              {isSaving && (
                <HStack justify='center'>
                  <Loader size='2xlarge' title='venter...' />
                </HStack>
              )}
              {product && (
                <VStack gap='5'>
                  <VarianterListe product={product} seriesId={seriesId} />
                </VStack>
              )}
            </VStack>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <HStack gap='2'>
            <Button
              onClick={() => {
                setModalIsOpen(false)
                setProduct(undefined)
                reset()
              }}
              variant='tertiary'
              type='reset'
            >
              Avbryt
            </Button>
          </HStack>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default NewProductDelkontraktModal
