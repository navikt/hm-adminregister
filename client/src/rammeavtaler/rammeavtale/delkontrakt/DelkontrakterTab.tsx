import { Alert, Button, Tabs, VStack } from '@navikt/ds-react'
import { AgreementPostDTO } from '../../../utils/response-types'
import { useState } from 'react'
import { Avstand } from '../../../components/Avstand'
import NewDelkontraktModal from './NewDelkontraktModal'
import { Delkontrakt } from './Delkontrakt'
import { useProductVariantsByAgreementId } from '../../../utils/swr-hooks'

const DelkontrakterTab = ({ posts, agreementId, mutateAgreement }: {
  posts: AgreementPostDTO[],
  agreementId: string,
  mutateAgreement: () => void
}) => {

  const {
    data: delkontrakter,
    isLoading: delkontrakterIsLoading,
    mutate: mutateDelkontrakter,
  }
    = useProductVariantsByAgreementId(agreementId)
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
                posts.map((post, i) => (
                    <Delkontrakt
                      key={i}
                      delkontrakt={post}
                      produkter={delkontrakter?.filter((produkt) => produkt.delkontraktNr === post.nr) || []}
                      agreementId={agreementId}
                      mutateDelkontrakter={mutateDelkontrakter}
                      mutateAgreement={mutateAgreement}
                    />

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
