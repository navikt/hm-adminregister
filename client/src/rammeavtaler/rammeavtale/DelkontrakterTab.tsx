import { Alert, ExpansionCard, Tabs, VStack } from '@navikt/ds-react'
import { AgreementPostDTO } from '../../utils/response-types'
import { useSearchParams } from 'react-router-dom'

const DelkontrakterTab = ({ posts }: { posts: AgreementPostDTO[] }) => {
  const pathname = window.location.pathname
  const [searchParams] = useSearchParams()


  const isFirstTime = posts.length === 1

  return (
    <Tabs.Panel value="delkontrakter" className="tab-panel">
      {isFirstTime && (
        <Alert variant="info">
          Produktet trenger en eller flere artikler. Her kan man legge inn artikler som varierer for eksempel i
          størrelse eller farge. Alle artiklene skal ha eget navn som skiller variantene fra hverandre, artikkelnummer
          fra leverandør og teknisk data.
        </Alert>
      )}
      {!isFirstTime && (
        <VStack gap="8">
          <>
            {posts.length > 0 && (
              posts.map((post) => (
                  <ExpansionCard key={post.nr} aria-label="default-demo">
                    <ExpansionCard.Header>
                      <ExpansionCard.Title>{post.title}</ExpansionCard.Title>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                      {post.description}
                    </ExpansionCard.Content>
                  </ExpansionCard>
                )
              ))
            }

          </>
        </VStack>
      )}

    </Tabs.Panel>
  )
}

export default DelkontrakterTab
