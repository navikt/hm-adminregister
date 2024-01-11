import { Alert, ExpansionCard, Tabs, VStack } from '@navikt/ds-react'
import { AgreementPostDTO } from '../../utils/response-types'

const DelkontrakterTab = ({ posts }: { posts: AgreementPostDTO[] }) => {

  const isFirstTime = posts.length === 0

  return (
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

    </Tabs.Panel>
  )
}

export default DelkontrakterTab
