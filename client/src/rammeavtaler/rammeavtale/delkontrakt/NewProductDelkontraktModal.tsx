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
import './../agreement-page.scss'

interface Props {
  modalIsOpen: boolean
  setModalIsOpen: (open: boolean) => void
  mutateAgreement: () => void
}

export type NewProductDelkontraktFormData = z.infer<typeof createNewProductOnDelkontraktSchema>

const NewProductDelkontraktModal = ({ modalIsOpen, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [productToAdd, setProductToAdd] = useState<ProductRegistrationDTO | undefined>(undefined)
  const [productToAddSeriesId, setProductToAddSeriesId] = useState<string | undefined>(undefined)
  const [variantsToAdd, setVariantsToAdd] = useState<string[]>([])

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

  async function onClickGetProduct(data: NewProductDelkontraktFormData) {

    if (!productToAdd || productToAdd.hmsArtNr !== data.hmsNummer) {
      getProduct(data.hmsNummer).then(
        (product) => {
          setProductToAdd(product)
          if (product.seriesId) {
            setProductToAddSeriesId(product.seriesId)
          }
        },
      ).catch((error) => {
        setGlobalError(error.status, error.message)
      })
    }
  }

  async function onClickLeggTilValgteVarianter() {
    setIsSaving(true)
    // todo: lagre varianter
    setIsSaving(false)
    reset()
    setVariantsToAdd([])
    setProductToAdd(undefined)
    setModalIsOpen(false)

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

          <div className='delkontrakter-tab__new-delkontrakt-container'>
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
              {productToAdd && (
                <VStack gap='5'>
                  <VarianterListe setValgteRader={setVariantsToAdd} product={productToAdd}
                                  seriesId={productToAddSeriesId} />
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
                setProductToAdd(undefined)
                setVariantsToAdd([])
                reset()
              }}
              variant='tertiary'
              type='reset'
            >
              Avbryt
            </Button>
            <Button
              onClick={() => {
                onClickLeggTilValgteVarianter()
              }}
              disabled={variantsToAdd.length === 0}
              variant='primary'
              type='button'
            >
              Legg til avhukede varianter
            </Button>
          </HStack>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default NewProductDelkontraktModal
