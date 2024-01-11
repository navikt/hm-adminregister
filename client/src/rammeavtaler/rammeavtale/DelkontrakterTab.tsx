import { Alert, Button, ExpansionCard, Tabs, VStack } from '@navikt/ds-react'
import { AgreementPostDTO } from '../../utils/response-types'
import { useState } from 'react'
import { Avstand } from '../../components/Avstand'
import NewDelkontraktModal from './NewDelkontraktModal'

const DelkontrakterTab = ({ posts, agreementId, mutateAgreement }: { posts: AgreementPostDTO[], agreementId: string, mutateAgreement: () => void }) => {

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const isFirstTime = posts.length === 0

  return (
    <>
      <NewDelkontraktModal
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
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
          <VStack gap='8'>
            <>
              {posts.length > 0 && (
                posts.map((post) => (
                    <ExpansionCard key={post.nr} aria-label='default-demo'>
                      <ExpansionCard.Header>
                        <ExpansionCard.Title>{post.title}</ExpansionCard.Title>
                      </ExpansionCard.Header>
                      <ExpansionCard.Content>
                        {post.description}
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
          onClick={() => setModalIsOpen(true)}
        >
          Legg til delkontrakt
        </Button>

      </Tabs.Panel>
    </>
  )
}

export default DelkontrakterTab
