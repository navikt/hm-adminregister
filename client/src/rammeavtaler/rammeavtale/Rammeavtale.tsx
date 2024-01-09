import React from 'react'
import useSWR from 'swr'
import { Alert, Button, Heading, HGrid, Loader, Tabs, VStack } from '@navikt/ds-react'
import { EyeClosedIcon } from '@navikt/aksel-icons'
import './agreement-page.scss'
import { FormProvider, useForm } from 'react-hook-form'
import AboutTab from './AboutTab'
import DelkontrakterTab from './DelkontrakterTab'
import FileTab from './FileTab'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useHydratedAuthStore } from '../../utils/store/useAuthStore'
import { useHydratedErrorStore } from '../../utils/store/useErrorStore'
import { AgreementRegistrationDTO } from '../../utils/response-types'
import { fetcherGET } from '../../utils/swr-hooks'
import StatusTag from '../../components/StatusTag'
import { HM_REGISTER_URL } from '../../environments'
import { updateAgreement } from '../../api/AgreementApi'

export type EditCommonInfoAgreement = {
  description: string
}

const AgreementPage = () => {
  const [searchParams] = useSearchParams()
  const { pathname } = useLocation()
  const activeTab = searchParams.get('tab')
  const { agreementId } = useParams()

  const { loggedInUser } = useHydratedAuthStore()
  const { setGlobalError } = useHydratedErrorStore()
  const agreementPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations/${agreementId}`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/agreement/registrations/${agreementId}`

  const navigate = useNavigate()

  const {
    data: agreement,
    error,
    isLoading,
    mutate: mutateAgreement,
  } = useSWR<AgreementRegistrationDTO>(loggedInUser ? agreementPath : null, fetcherGET)

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`)
  }

  const formMethods = useForm<EditCommonInfoAgreement>()

  async function onSubmit(data: EditCommonInfoAgreement) {
    updateAgreement(agreement!!.id, data).then(
      (agreement) =>
        mutateAgreement(agreement),
    ).catch((error) => {
      setGlobalError(error.status, error.message)
    })
  }

  if (error) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        Error
      </HGrid>
    )
  }

  if (isLoading) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        <Loader size='large' />
      </HGrid>
    )
  }

  if (!agreement) {
    return (
      <HGrid gap='12' columns='minmax(16rem, 55rem)'>
        <Alert variant='info'>Ingen data funnet.</Alert>
      </HGrid>
    )
  }

  const isDraft = agreement.draftStatus === 'DRAFT'

  return (
    <main className='show-menu'>
      <FormProvider {...formMethods}>
        <HGrid gap='12' columns={{ xs: 1, sm: 'minmax(16rem, 55rem) 200px' }} className='product-page'>
          <VStack gap={{ xs: '4', md: '8' }}>
            <VStack gap='1'>
              <Heading level='1' size='xlarge'>
                {agreement.title ?? agreement.title}
              </Heading>
            </VStack>
            <Tabs defaultValue={activeTab || 'about'} onChange={updateUrlOnTabChange}>
              <Tabs.List>
                <Tabs.Tab value='about' label='Om avtalen' />
                <Tabs.Tab value='delkontrakter' label='Delkontrakter' />
                <Tabs.Tab value='documents' label='Dokumenter' />
              </Tabs.List>
              <AboutTab agreement={agreement} onSubmit={onSubmit} />
              <FileTab agreement={agreement} mutateAgreement={mutateAgreement} />
              <DelkontrakterTab posts={agreement.agreementData.posts} />
            </Tabs>
          </VStack>
          <VStack gap={{ xs: '2', md: '4' }}>
            <Heading level='1' size='medium'>
              Status
            </Heading>
            <StatusTag isPending={false} isDraft={isDraft} />
            <PublishButton isAdmin={loggedInUser?.isAdmin || false} isPending={false} isDraft={isDraft} />
            <Button variant='secondary' disabled={isDraft} icon={<EyeClosedIcon aria-hidden fontSize={'1.5rem'} />}>
              Avpubliser
            </Button>
          </VStack>
        </HGrid>
      </FormProvider>
    </main>
  )
}
export default AgreementPage

const PublishButton = ({ isAdmin, isPending, isDraft }: { isAdmin: boolean; isPending: boolean; isDraft: boolean }) => {
  if (isDraft) {
    return (
      <Button style={{ marginTop: '20px' }} disabled={isAdmin}>
        Send til godkjenning
      </Button>
    )
  } else if (isAdmin && isPending) {
    return <Button style={{ marginTop: '20px' }}>Publiser</Button>
  } else if (!isAdmin && isPending) {
    return (
      <Button style={{ marginTop: '20px' }} disabled={true}>
        Send til godkjenning
      </Button>
    )
  } else {
    return (
      <Button style={{ marginTop: '20px' }} disabled={true}>
        Publiser
      </Button>
    )
  }
}
