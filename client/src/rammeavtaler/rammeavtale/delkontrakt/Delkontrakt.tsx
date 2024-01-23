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
import ConfirmModal from '../../../components/ConfirmModal'

interface Props {
  delkontrakt: AgreementPostDTO
  produkter: ProduktvarianterForDelkontrakterDTOList
  agreementId: string
  mutateDelkontrakter: () => void
}

export const Delkontrakt = ({ delkontrakt, produkter, agreementId, mutateDelkontrakter }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const [nyttProduktModalIsOpen, setNyttProduktModalIsOpen] = useState<boolean>(false)
  const [varianter, setVarianter] = useState<ProductAgreementRegistrationDTOList>([])
  const [editDelkontraktModalIsOpen, setEditDelkontraktModalIsOpen] = useState<boolean>(false)
  const [deleteDelkontraktIsOpen, setDeleteDelkontraktIsOpen] = useState<boolean>(false)


  const onClickVariants = (valgtVariantListe: ProductAgreementRegistrationDTOList) => {
    setVarianter(valgtVariantListe)
    setModalIsOpen(true)
  }


  const onConfirmDeleteDelkontrakt = () => {
    // todo: delete delkontrakt
    setDeleteDelkontraktIsOpen(false)

  }

  return (
    <>
      <EditDelkontraktModal
        modalIsOpen={editDelkontraktModalIsOpen}
        setModalIsOpen={setEditDelkontraktModalIsOpen}
        oid={agreementId}
        delkontrakt={delkontrakt}
        mutateDelkontrakter={mutateDelkontrakter}
      />
      <ConfirmModal
        title={`Slett '${delkontrakt.title}'`}
        text='Er du sikker på at du vil slette delkontrakten?'
        onClick={onConfirmDeleteDelkontrakt}
        onClose={() => {
          setDeleteDelkontraktIsOpen(false)
        }}
        isModalOpen={deleteDelkontraktIsOpen}
      />
      <NewProductDelkontraktModal
        modalIsOpen={nyttProduktModalIsOpen}
        setModalIsOpen={setNyttProduktModalIsOpen}
        agreementId={agreementId}
        post={delkontrakt.nr}
        mutateDelkontrakter={mutateDelkontrakter} />
      <EditProducstVariantsModal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen} varianter={varianter} />

      <ExpansionCard size='small' key={delkontrakt.nr} aria-label='default-demo'>
        <ExpansionCard.Header>
          <ExpansionCard.Title size='small'>{delkontrakt.title}</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content style={{ overflow: 'auto' }}>
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
                    <Dropdown.Menu.List.Item
                      onClick={() => {
                        setDeleteDelkontraktIsOpen(true)
                      }}
                    >
                      Slett delkontrakt
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