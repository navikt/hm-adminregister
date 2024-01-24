import { Button, Checkbox, HStack, Modal, Table, VStack } from '@navikt/ds-react'
import React, { useState } from 'react'
import { ProductAgreementRegistrationDTOList } from '../../../utils/response-types'

interface Props {
  modalIsOpen: boolean
  setModalIsOpen: (open: boolean) => void
  varianter: ProductAgreementRegistrationDTOList
}


const EditProducstVariantsModal = ({ modalIsOpen, setModalIsOpen, varianter }: Props) => {

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value)
        ? list.filter((id: string) => id !== value)
        : [...list, value],
    )

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
        <div className='delkontrakter-tab__new-delkontrakt-container'>
          {varianter.length > 0 && (
            <VStack gap='2' style={{width: '100%'}}>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope='col'>Navn</Table.HeaderCell>
                      <Table.HeaderCell scope='col'>HMS-nummer</Table.HeaderCell>
                      <Table.HeaderCell scope='col'>Lev-artnr.</Table.HeaderCell>
                      <Table.DataCell>
                        <Checkbox
                          checked={selectedRows.length === varianter.length}
                          onChange={() => {
                            selectedRows.length
                              ? setSelectedRows([])
                              : setSelectedRows(varianter.map(({ id }) => id!!))
                          }}
                          hideLabel
                        >
                          Velg alle rader
                        </Checkbox>
                      </Table.DataCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>

                    {varianter.map((variant, i) => {
                      return (
                        <Table.Row key={variant.id}>
                          <Table.DataCell>{variant.articleName}</Table.DataCell>
                          <Table.DataCell>{variant.hmsArtNr}</Table.DataCell>
                          <Table.DataCell>{variant.supplierRef}</Table.DataCell>
                          <Table.DataCell>
                            <Checkbox
                              hideLabel
                              checked={selectedRows.includes(variant.id!!)}
                              onChange={() => {
                                toggleSelectedRow(variant.id!!)
                              }}
                              aria-labelledby={`id-${variant.id}`}
                            >
                              {' '}
                            </Checkbox>
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
