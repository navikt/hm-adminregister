import {
  AgreementPostDTO,
  ProductAgreementRegistrationDTOList,
  ProduktvarianterForDelkontrakterDTOList,
} from '../../../utils/response-types'
import { Button, Dropdown, ExpansionCard, HStack, Table, VStack } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon, PencilWritingIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons'
import React, { useState } from 'react'
import NewProductOnDelkontraktModal from './NewProductOnDelkontraktModal'
import EditDelkontraktInfoModal from './EditDelkontraktInfoModal'
import ConfirmModal from '../../../components/ConfirmModal'
import { deleteProductsFromAgreement } from '../../../api/AgreementProductApi'
import { useHydratedErrorStore } from '../../../utils/store/useErrorStore'
import { deleteDelkontrakt } from '../../../api/AgreementApi'
import EditProducstVariantsModal from './EditProductVariantsOnDelkontraktModal'

interface Props {
  delkontrakt: AgreementPostDTO
  produkter: ProduktvarianterForDelkontrakterDTOList
  agreementId: string
  mutateDelkontrakter: () => void
  mutateAgreement: () => void
}

export const Delkontrakt = ({ delkontrakt, produkter, agreementId, mutateDelkontrakter, mutateAgreement }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const [nyttProduktModalIsOpen, setNyttProduktModalIsOpen] = useState<boolean>(false)
  const [varianter, setVarianter] = useState<ProductAgreementRegistrationDTOList>([])
  const [editDelkontraktModalIsOpen, setEditDelkontraktModalIsOpen] = useState<boolean>(false)
  const [deleteDelkontraktIsOpen, setDeleteDelkontraktIsOpen] = useState<boolean>(false)

  const [deleteProduktserieModalIsOpen, setDeleteProduktserieModalIsOpen] = useState<boolean>(false)
  const [produktserieToDelete, setProduktserieToDelete] = useState<ProductAgreementRegistrationDTOList>([])
  const [produktserieToDeleteTitle, setProduktserieToDeleteTitle] = useState<string | null>(null)

  const { setGlobalError } = useHydratedErrorStore()

  const onClickVariants = (valgtVariantListe: ProductAgreementRegistrationDTOList) => {
    setVarianter(valgtVariantListe)
    setModalIsOpen(true)
  }


  const onConfirmDeleteDelkontrakt = () => {

    deleteDelkontrakt(agreementId, delkontrakt.identifier).then(
      () => {
        mutateAgreement()
      },
    ).catch((error) => {
      setGlobalError(error.message)
    })
    setDeleteDelkontraktIsOpen(false)
  }

  const onConfirmDeleteProduktserie = () => {

    const productAgreementsToDelete =
      produktserieToDelete.map((variant) => {
        return variant.id
      })

    deleteProductsFromAgreement(productAgreementsToDelete).then(
      () => {
        mutateDelkontrakter()
      },
    ).catch((error) => {
      setGlobalError(error.message)
    })
    setDeleteProduktserieModalIsOpen(false)

  }

  return (
    <>
      <EditDelkontraktInfoModal
        modalIsOpen={editDelkontraktModalIsOpen}
        setModalIsOpen={setEditDelkontraktModalIsOpen}
        oid={agreementId}
        delkontrakt={delkontrakt}
        mutateAgreement={mutateAgreement}
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
      <ConfirmModal
        title={`Slett produktserie '${produktserieToDeleteTitle}'`}
        text='Er du sikker på at du vil slette produktserie?'
        onClick={onConfirmDeleteProduktserie}
        onClose={() => {
          setDeleteProduktserieModalIsOpen(false)
        }}
        isModalOpen={deleteProduktserieModalIsOpen}
      />
      <NewProductOnDelkontraktModal
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
                          <Table.DataCell>
                            {produkt.serieIdentifier ? (
                              <a href={`https://finnhjelpemiddel.nav.no/produkt/${produkt.serieIdentifier}`}
                                 target='_blank' rel='noreferrer'>
                                {produkt.produktTittel}
                              </a>
                            ) : (
                              produkt.produktTittel
                            )
                            }

                          </Table.DataCell>
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
                                setProduktserieToDelete(produkt.produktvarianter)
                                setProduktserieToDeleteTitle(produkt.produktTittel)
                                setDeleteProduktserieModalIsOpen(true)
                              }} />
                          </Table.DataCell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table>
              </VStack>
            )
            }

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