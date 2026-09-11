import React, { useEffect, useState } from 'react'

import Content from 'felleskomponenter/styledcomponents/Content'
import { ProductRegistrationDTOV2 } from 'utils/types/response-types'

import { BodyShort, Box, Button, Checkbox, Modal, Table, VStack } from '@navikt/ds-react'

interface Props {
  isModalOpen: boolean
  onClose: () => void
  onConfirm: (targetProductIds: string[]) => void
  techKey: string
  value: string
  sourceProduct: ProductRegistrationDTOV2
  otherVariants: ProductRegistrationDTOV2[]
}

// Lets admin copy the current value of one tech data field from one variant to a chosen set of
// other variants in the same series, in one action. The result is written into the same local
// "uncommitted changes" state as inline editing (see useTechDataChanges) and saved together with
// any other pending edits when the admin clicks "Lagre endringer" - this modal itself does not
// call the save API.
const CopyTechDataValueModal = ({ isModalOpen, onClose, onConfirm, techKey, value, sourceProduct, otherVariants }: Props) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Pre-select variants that are missing the value or have a different value, since those are
  // the most likely targets for a "copy this value everywhere" action.
  useEffect(() => {
    if (!isModalOpen) return
    setSelectedRows(
      otherVariants
        .filter((variant) => {
          const existing = variant.productData.techData.find((field) => field.key === techKey)
          return (existing?.value ?? '') !== value
        })
        .map((variant) => variant.id!)
    )
  }, [isModalOpen, otherVariants, techKey, value])

  const toggleSelectedRow = (id: string) =>
    setSelectedRows((list) => (list.includes(id) ? list.filter((rowId) => rowId !== id) : [...list, id]))

  const handleClose = () => {
    setSelectedRows([])
    onClose()
  }

  return (
    <Modal
      open={isModalOpen}
      header={{ heading: `Kopier verdi for "${techKey}" til flere varianter`, closeButton: false }}
      onClose={handleClose}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            <Box background="raised" padding="space-16" borderRadius="8" shadow="dialog">
              <BodyShort>
                Kopierer fra <b>{sourceProduct.articleName || sourceProduct.hmsArtNr || sourceProduct.supplierRef}</b>
                : <b>{techKey}</b> = <b>{value || '(tom verdi)'}</b>
              </BodyShort>
            </Box>
            {otherVariants.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Variant</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Nåværende verdi</Table.HeaderCell>
                    <Table.DataCell>
                      <Checkbox
                        checked={selectedRows.length === otherVariants.length}
                        onChange={() => {
                          selectedRows.length
                            ? setSelectedRows([])
                            : setSelectedRows(otherVariants.map((variant) => variant.id!))
                        }}
                        hideLabel
                      >
                        Velg alle rader
                      </Checkbox>
                    </Table.DataCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {otherVariants.map((variant) => {
                    const existing = variant.productData.techData.find((field) => field.key === techKey)
                    return (
                      <Table.Row key={variant.id}>
                        <Table.DataCell>{variant.articleName || variant.hmsArtNr || variant.supplierRef}</Table.DataCell>
                        <Table.DataCell>{existing?.value || '-'}</Table.DataCell>
                        <Table.DataCell>
                          <Checkbox
                            hideLabel
                            checked={selectedRows.includes(variant.id!)}
                            onChange={() => toggleSelectedRow(variant.id!)}
                            aria-labelledby={`copy-tech-data-${variant.id}`}
                          >
                            {' '}
                          </Checkbox>
                        </Table.DataCell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            ) : (
              <BodyShort>Ingen andre varianter å kopiere til.</BodyShort>
            )}
          </VStack>
        </Content>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            onConfirm(selectedRows)
            handleClose()
          }}
          variant="primary"
          disabled={selectedRows.length === 0}
        >
          Kopier til {selectedRows.length} {selectedRows.length === 1 ? 'variant' : 'varianter'}
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CopyTechDataValueModal
