import { Alert, Button, Dropdown, ExpansionCard, HStack, Tabs, VStack } from '@navikt/ds-react'
import { AgreementPostDTO } from '../../utils/response-types'
import { useState } from 'react'
import { Avstand } from '../../components/Avstand'
import NewDelkontraktModal from './NewDelkontraktModal'
import { MenuElipsisVerticalIcon, PlusCircleIcon } from '@navikt/aksel-icons'

const DelkontrakterTab = ({ posts, agreementId, mutateAgreement }: {
  posts: AgreementPostDTO[],
  agreementId: string,
  mutateAgreement: () => void
}) => {

  const [nyRammeavtaleModalIsOpen, setNyRammeavtaleModalIsOpen] = useState(false)
  const isFirstTime = posts.length === 0

  return (
    <>
      <NewDelkontraktModal
        modalIsOpen={nyRammeavtaleModalIsOpen}
        setModalIsOpen={setNyRammeavtaleModalIsOpen}
        oid={agreementId}
        mutateAgreement={mutateAgreement}
      />
      <Tabs.Panel value='delkontrakter' className='tab-panel'>
        {isFirstTime && (
          <Alert variant='info'>
            Rammeavtalen trenger delkontrakter.
          </Alert>
        )}
        {!isFirstTime && (
          <VStack gap='5'>
            <>
              {posts.length > 0 && (
                posts.map((post) => (
                    <ExpansionCard size='small' key={post.nr} aria-label='default-demo'>
                      <ExpansionCard.Header>
                        <ExpansionCard.Title size='small'>{post.title}</ExpansionCard.Title>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        <VStack>

                          <p className='beskrivelse'><b>Beskrivelse:</b></p>
                          {post.description}
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
                                style={{ marginLeft: 'auto' }}
                                as={Dropdown.Toggle} />
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

                  ),
                ))
              }
            </>
          </VStack>
        )}
        <Avstand marginBottom={5} />
        <Button
          className='fit-content'
          variant='secondary'
          onClick={() => setNyRammeavtaleModalIsOpen(true)}
        >
          Legg til delkontrakt
        </Button>

      </Tabs.Panel>
    </>
  )
}

export default DelkontrakterTab
