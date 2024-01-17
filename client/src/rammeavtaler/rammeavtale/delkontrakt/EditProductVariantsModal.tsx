import { Button, HStack, Modal, Table, VStack } from '@navikt/ds-react'
import React from 'react'
import { ProductAgreementRegistrationDTOList } from '../../../utils/response-types'
import { PencilWritingIcon, TrashIcon } from '@navikt/aksel-icons'

interface Props {
  modalIsOpen: boolean
  setModalIsOpen: (open: boolean) => void
  varianter: ProductAgreementRegistrationDTOList
}


const EditProducstVariantsModal = ({ modalIsOpen, setModalIsOpen, varianter }: Props) => {


  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: 'Produktvarianter på avtalen',
        closeButton: false,
        size: 'small',
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <div
          className='delkontrakter-tab__new-delkontrakt-container'
        >
          {varianter.length > 0 && (
            <VStack gap='2'>
              <Table size='medium'>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope='col'>Navn på variant</Table.HeaderCell>
                    <Table.HeaderCell scope='col'>Hms-nummer.</Table.HeaderCell>
                    <Table.HeaderCell scope='col'>Lev-artnr.</Table.HeaderCell>
                    <Table.HeaderCell scope='col'></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {varianter.map((variant, i) => {
                    return (
                      <Table.Row key={i} shadeOnHover={false}>
                        <Table.DataCell>{variant.title}</Table.DataCell>
                        <Table.DataCell>{variant.hmsArtNr}</Table.DataCell>
                        <Table.DataCell>{variant.supplierRef}</Table.DataCell>
                        <Table.DataCell>
                          <Button
                            iconPosition='right'
                            variant={'tertiary'}
                            icon={
                              <TrashIcon
                                title='Slett'
                                fontSize='1.2rem'
                              />
                            }

                            onClick={() => {

                            }} />
                        </Table.DataCell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            </VStack>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <HStack gap='2'>
          <Button
            onClick={() => {
              setModalIsOpen(false)
            }}
            variant='tertiary'
            type='reset'
          >
            Lukk
          </Button>
        </HStack>
      </Modal.Footer>
    </Modal>
  )
}

export default EditProducstVariantsModal
