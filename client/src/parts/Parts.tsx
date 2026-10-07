import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { AlertWithCloseButton } from 'felleskomponenter/AlertWithCloseButton'
import PartsListTab from 'parts/PartsListTab'
import SeriesListTab from 'parts/SeriesListTab'
import { useAuthStore } from 'utils/store/useAuthStore'

import { FileExportIcon, PlusIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, HStack, Heading, Tabs, VStack } from '@navikt/ds-react'

const Parts = () => {
  const { loggedInUser } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'deler'
  const [exportOpen, setExportOpen] = useState(false)
  const closeExport = () => setExportOpen(false)

  const updateUrlOnTabChange = (value: string) => {
    navigate(`${pathname}?tab=${value}`)
  }

  return (
    <main className="show-menu">
      <VStack
        gap={{ xs: 'space-8', md: 'space-24' }}
        maxWidth={loggedInUser && loggedInUser.isAdminOrHmsUser ? '80rem' : '64rem'}
      >
        <Heading level="1" size="large" spacing>
          Deler
        </Heading>
        <AlertWithCloseButton variant={'warning'} alertId={'tilbReadyAlert'}>
          <Heading size={'small'}>Informasjon om deler</Heading>
          <BodyLong>
            Det er nå mulig å legge inn og redigere tilbehør og reservedeler. Vi oppfordrer dere til å legge inn bilder
            og beskrivelser av disse delene.
          </BodyLong>
        </AlertWithCloseButton>
        {loggedInUser && (
          <HStack gap="space-8" align="center">
            <Button
              variant="secondary"
              icon={<PlusIcon aria-hidden />}
              iconPosition="left"
              onClick={() => navigate('/del/opprett')}
              style={{ maxHeight: '3rem', whiteSpace: 'nowrap' }}
            >
              Opprett ny del
            </Button>
            {loggedInUser.isAdmin && (
              <Button
                variant="secondary"
                icon={<FileExportIcon aria-hidden />}
                iconPosition="left"
                onClick={() => setExportOpen(true)}
                style={{ maxHeight: '3rem', whiteSpace: 'nowrap' }}
              >
                Eksporter
              </Button>
            )}
          </HStack>
        )}
        <Tabs defaultValue={activeTab || 'about'} onChange={updateUrlOnTabChange}>
          <Tabs.List>
            <Tabs.Tab value="deler" label="Søk på del" />
            <Tabs.Tab value="serier" label="Deler på serie" />
          </Tabs.List>
          <PartsListTab exportOpen={exportOpen && activeTab === 'deler'} onExportClose={closeExport} />
          <SeriesListTab exportOpen={exportOpen && activeTab === 'serier'} onExportClose={closeExport} />
        </Tabs>
      </VStack>
    </main>
  )
}

export default Parts
