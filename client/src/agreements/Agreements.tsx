import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import ErrorAlert from 'error/ErrorAlert'
import { AgreementFilterOption, useAgreements, usePagedAgreements } from 'utils/swr-hooks'
import { AgreementGroup, AgreementGroupDto } from 'utils/types/response-types'

import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from '@navikt/aksel-icons'
import {
  ActionMenu,
  Alert,
  Box,
  Button,
  HGrid,
  HStack,
  Heading,
  LinkCard,
  Loader,
  Pagination,
  Search,
  Tag,
  ToggleGroup,
  VStack,
} from '@navikt/ds-react'

export const Agreements = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFilterOption, setSelectedFilterOption] = useState<string>(
    searchParams.get('filter') ?? AgreementFilterOption.ALL
  )

  const [isSearching, setIsSearching] = useState(false)

  const [pageState, setPageState] = useState(Number(searchParams.get('page')) || 1)
  const pageSize = 10
  const { data: allData, error: allError } = useAgreements()
  const {
    data: pagedData,
    isLoading: pagedIsLoading,
    error: pagedError,
  } = usePagedAgreements({
    page: pageState - 1,
    pageSize,
    filter: selectedFilterOption as AgreementFilterOption,
  })
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredData, setFilteredData] = useState<AgreementGroupDto | undefined>()
  const navigate = useNavigate()

  const showPageNavigator = !!pagedData && !!pagedData.totalPages && pagedData.totalPages > 1 && searchTerm.length === 0

  if (allError || pagedError) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    )
  }

  const handeFilterChange = (filter: string) => {
    searchParams.set('filter', filter)
    setPageState(1)
    searchParams.set('page', '1')
    setSelectedFilterOption(filter)
    setSearchParams(searchParams)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setIsSearching(true)
    const filteredAgreements = allData?.content.filter((agreement) =>
      agreement.title.toLowerCase().includes(value.toLowerCase())
    )
    if (value.length == 0) {
      setFilteredData(undefined)
      setIsSearching(false)
    } else {
      setFilteredData(filteredAgreements)
    }
  }

  return (
    <main className="show-menu">
      <VStack gap="space-12" maxWidth="66rem">
        <Heading level="1" size="large" spacing>
          Rammeavtaler
        </Heading>

        <VStack gap="space-16">
          <HGrid columns={{ xs: '1fr', md: '5fr 6fr' }} gap="space-4" align={'start'}>
            <Box role="search" style={{ maxWidth: '475px' }} asChild>
              <Search
                className="search-button"
                label="Søk etter et produkt"
                variant="simple"
                clearButton={true}
                placeholder="Søk etter rammeavtale"
                size="medium"
                value={searchTerm}
                onChange={(value) => handleSearch(value)}
              />
            </Box>

            {!isSearching && (
              <HGrid columns={'1fr 48px'} gap={'space-4'}>
                <ToggleGroup defaultValue={AgreementFilterOption.ALL} onChange={handeFilterChange}>
                  <ToggleGroup.Item value={AgreementFilterOption.ALL} label={'Alle'} />
                  <ToggleGroup.Item value={AgreementFilterOption.ACTIVE} label={'Aktive'} />
                  <ToggleGroup.Item value={AgreementFilterOption.FUTURE} label={'Fremtidige'} />
                  <ToggleGroup.Item value={AgreementFilterOption.EXPIRED} label={'Utgåtte'} />
                </ToggleGroup>

                <ActionMenu>
                  <ActionMenu.Trigger>
                    <Button
                      variant={'secondary'}
                      icon={<MenuElipsisVerticalIcon aria-hidden fontSize={'1.5rem'} />}
                      aria-label={'Rammeavtale-meny'}
                      size={'xsmall'}
                      style={{ width: '48px', height: '48px' }}
                    />
                  </ActionMenu.Trigger>
                  <ActionMenu.Content>
                    <ActionMenu.Item
                      icon={<PlusIcon aria-hidden />}
                      onSelect={() => {
                        navigate('/rammeavtaler/opprett')
                      }}
                    >
                      Ny rammeavtale
                    </ActionMenu.Item>
                    <ActionMenu.Item
                      icon={<FileExcelIcon aria-hidden />}
                      onSelect={() => {
                        navigate('/katalog/importer-fil')
                      }}
                    >
                      Importer katalogfil
                    </ActionMenu.Item>
                  </ActionMenu.Content>
                </ActionMenu>
              </HGrid>
            )}
          </HGrid>

          {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
            <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
          ) : filteredData && filteredData.length > 0 ? (
            <div className="panel-list__container">
              {pagedIsLoading && <Loader size="3xlarge" title="venter..." />}
              {filteredData &&
                filteredData.map((rammeavtale, i) => (
                  <AgreementLinkCard key={rammeavtale.id + i} rammeavtale={rammeavtale} />
                ))}
            </div>
          ) : (
            <div className="panel-list__container">
              {pagedIsLoading && <Loader size="3xlarge" title="venter..." />}
              {pagedData?.content && pagedData?.content.length === 0 && (
                <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
              )}
              {pagedData?.content &&
                pagedData?.content.map((rammeavtale, i) => (
                  <AgreementLinkCard key={rammeavtale.id + i} rammeavtale={rammeavtale} />
                ))}
            </div>
          )}

          {showPageNavigator && (
            <Pagination
              page={pageState}
              onPageChange={(x) => {
                searchParams.set('page', x.toString())
                setSearchParams(searchParams)
                setPageState(x)
              }}
              count={pagedData.totalPages!}
              size={'small'}
            />
          )}
        </VStack>
      </VStack>
    </main>
  )
}

export const AgreementLinkCard = ({ rammeavtale }: { rammeavtale: AgreementGroup }) => {
  return (
    <LinkCard size={'small'}>
      <LinkCard.Title>
        <HGrid columns={'auto minmax(max-content, 1fr)'} gap={'space-12'} align={'center'}>
          <LinkCard.Anchor asChild>
            <Link to={`/rammeavtaler/${rammeavtale.id}`}>{rammeavtale.title}</Link>
          </LinkCard.Anchor>
          <HStack gap={'space-4'}>
            <Tag variant="neutral" size="small">
              {rammeavtale.reference}
            </Tag>
            {rammeavtale.agreementStatus === 'ACTIVE' ? (
              <Tag variant="success" size={'small'}>
                Aktiv
              </Tag>
            ) : (
              <Tag variant="warning" size={'small'}>
                Inaktiv
              </Tag>
            )}
          </HStack>
        </HGrid>
      </LinkCard.Title>
    </LinkCard>
  )
}
