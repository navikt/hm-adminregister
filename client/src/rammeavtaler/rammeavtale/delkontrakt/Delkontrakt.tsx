import {
  AgreementPostDTO,
  ProductAgreementRegistrationDTOList,
  ProduktvarianterForDelkontrakterDTOList,
} from '../../../utils/response-types'
import { Button, Dropdown, ExpansionCard, HStack, Table, VStack } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon, PencilWritingIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons'
import EditProducstVariantsModal from './EditProductVariantsModal'
import React, { useState } from 'react'
import NewProductDelkontraktModal from './NewProductDelkontraktModal'
import EditDelkontraktModal from './EditDelkontraktModal'

interface Props {
  delkontrakt: AgreementPostDTO
  produkter: ProduktvarianterForDelkontrakterDTOList
  agreementId: string
  delkontraktId: string
  mutateAgreement: () => void
}

export const Delkontrakt = ({ delkontrakt, produkter, agreementId, mutateAgreement }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const [nyttProduktModalIsOpen, setNyttProduktModalIsOpen] = useState<boolean>(false)
  const [varianter, setVarianter] = useState<ProductAgreementRegistrationDTOList>([])

  const [editDelkontraktModalIsOpen, setEditDelkontraktModalIsOpen] = useState<boolean>(false)

  const onClickVariants = (valgtVariantListe: ProductAgreementRegistrationDTOList) => {
    setVarianter(valgtVariantListe)
    setModalIsOpen(true)
  }

  return (
    <>
      <EditDelkontraktModal
        modalIsOpen={editDelkontraktModalIsOpen}
        setModalIsOpen={setEditDelkontraktModalIsOpen}
        oid={agreementId}
        delkontrakt={delkontrakt}
        mutateAgreement={mutateAgreement}
      />
      <NewProductDelkontraktModal modalIsOpen={nyttProduktModalIsOpen} setModalIsOpen={setNyttProduktModalIsOpen}
                                  mutateAgreement={() => {
                                  }} />
      <EditProducstVariantsModal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} varianter={varianter} />

      <ExpansionCard size='small' key={delkontrakt.nr} aria-label='default-demo'>
        <ExpansionCard.Header>
          <ExpansionCard.Title size='small'>{delkontrakt.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          <VStack gap='3'>
            <p className='beskrivelse'><b>Beskrivelse:</b></p>
            {delkontrakt.description}
            {produkter.length > 0 && (
              <VStack gap='2'>
                <Table size='small' className='delkontrakter-tab__products' style={{ borderCollapse: 'separate' }}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope='col'>Produkter</Table.HeaderCell>
                      <Table.HeaderCell scope='col'>Artikler.</Table.HeaderCell>
                      <Table.HeaderCell scope='col'>Rangering</Table.HeaderCell>
                      <Table.HeaderCell scope='col'></Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {produkter.map((produkt, i) => {
                      return (
                        <Table.Row key={i} shadeOnHover={false}>
                          <Table.DataCell>{produkt.produktTittel}</Table.DataCell>
                          <Table.DataCell>
                            <Button
                              iconPosition='right'
                              variant={'tertiary'}
                              icon={
                                <PencilWritingIcon
                                  title='Rediger'
                                  fontSize='1.2rem'
                                />
                              }

                              onClick={() => {
                                onClickVariants(produkt.produktvarianter)
                              }}>
                              {produkt.produktvarianter.length}

                            </Button>
                          </Table.DataCell>
                          <Table.DataCell>{produkt.rangering}</Table.DataCell>
                          <Table.DataCell>
                            <Button
                              iconPosition='right'
                              variant={'tertiary'}
                              icon={
                                <TrashIcon
                                  title='Slett'
                                  fontSize='1.5rem'
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

            <HStack>
              <Button
                className='fit-content'
                variant='tertiary'
                icon={
                  <PlusCircleIcon
                    title='Legg til produkt'
                    fontSize='1.5rem'
                  />
                }
                onClick={() => {
                  setNyttProduktModalIsOpen(true)
                }}
              >
                <span className='produkt-button'>Legg til Produkt</span>
              </Button>
              <Dropdown>
                <Button
                  style={{ marginLeft: 'auto' }}
                  variant='tertiary'
                  icon={
                    <MenuElipsisVerticalIcon
                      title='Rediger'
                      fontSize='1.5rem'
                    />
                  }

                  as={Dropdown.Toggle}>
                </Button>
                <Dropdown.Menu>
                  <Dropdown.Menu.GroupedList>
                    <Dropdown.Menu.GroupedList.Item onClick={() => {
                      setEditDelkontraktModalIsOpen(true)
                    }}>
                      Endre tittel og beskrivelse
                    </Dropdown.Menu.GroupedList.Item>
                  </Dropdown.Menu.GroupedList>
                  <Dropdown.Menu.Divider />
                  <Dropdown.Menu.List>
                    <Dropdown.Menu.List.Item href='https://nav.no'>
                      Slett
                    </Dropdown.Menu.List.Item>
                  </Dropdown.Menu.List>
                </Dropdown.Menu>
              </Dropdown>
            </HStack>
          </VStack>
        </ExpansionCard.Content>
      </ExpansionCard>
    </>
  )
}