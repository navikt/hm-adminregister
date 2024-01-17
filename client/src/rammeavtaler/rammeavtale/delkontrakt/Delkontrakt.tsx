import {
  AgreementPostDTO,
  ProductAgreementRegistrationDTOList,
  ProduktvarianterForDelkontrakterDTOList,
} from '../../../utils/response-types'
import { Button, Dropdown, ExpansionCard, HStack, Table, VStack } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon, PencilWritingIcon, PlusCircleIcon } from '@navikt/aksel-icons'
import { EditProductOnDelkontrakt } from '../EditProductOnDelkontrakt'
import EditProducstVariantsModal from './EditProductVariantsModal'
import { useState } from 'react'

interface Props {
  delkontrakt: AgreementPostDTO
  produkter: ProduktvarianterForDelkontrakterDTOList
}

export const Delkontrakt = ({ delkontrakt, produkter }: Props) => {

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)
  const [varianter, setVarianter] = useState<ProductAgreementRegistrationDTOList>([])
  const onClickVariants = (valgtVariantListe: ProductAgreementRegistrationDTOList) => {
    setVarianter(valgtVariantListe)
    setModalIsOpen(true)
  }

  return (
    <>
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
                          <Table.DataCell><EditProductOnDelkontrakt /></Table.DataCell>
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

                }}
              >
                <span className='produkt-button'>Legg til Produkt</span>
              </Button>
              <Dropdown>
                <Button
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