import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import ErrorAlert from 'error/ErrorAlert'
import { AgreementFilterOption, useAgreements, usePagedAgreements } from 'utils/swr-hooks'
import { AgreementGroupDto } from 'utils/types/response-types'

import { FileExcelIcon, MenuElipsisVerticalIcon, PlusIcon } from '@navikt/aksel-icons'
import {
  ActionMenu,
  Alert,
  BodyShort,
  Box,
  Button,
  Heading,
  HGrid,
  HStack,
  LinkPanel,
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

  const [pageState, setPageState] = useState(Number(searchParams.get('page')) || 1)
  const pageSize = 10
  const { data: allData, isLoading: allDataIsLoading, error: allError } = useAgreements()
  const {
    data: pagedData,
    isLoading,
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
    const filteredAgreements = allData?.content.filter((agreement) =>
      agreement.title.toLowerCase().includes(value.toLowerCase())
    )
    if (value.length == 0) {
      setFilteredData(undefined)
    } else {
      setFilteredData(filteredAgreements)
    }
  }

  return (
    <main className="show-menu">
      <VStack gap="space-12" maxWidth="60rem">
        <Heading level="1" size="large" spacing>
          Rammeavtaler
        </Heading>

        <VStack gap="space-16">
          <HGrid columns={{ xs: '1fr', md: '5fr 6fr 1fr' }} gap="space-4" align={'start'}>
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
                  icon={<MenuElipsisVerticalIcon aria-hidden />}
                  aria-label={'Rammeavtale-meny'}
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

          {filteredData && filteredData.length === 0 && searchTerm.length > 0 ? (
            <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
          ) : filteredData && filteredData.length > 0 ? (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {filteredData &&
                filteredData.map((rammeavtale, i) => (
                  <>
                    <LinkPanel
                      onClick={() => navigate(`/rammeavtaler/${rammeavtale.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          navigate(`/rammeavtaler/${rammeavtale.id}`)
                        }
                      }}
                      className="panel-list__name-panel"
                      key={i}
                    >
                      <LinkPanel.Title className="panel-list__title panel-list__width">
                        <HStack gap="space-2 space-2" align="center">
                          <BodyShort> {rammeavtale.title || 'Ukjent produktnavn'} </BodyShort>
                          {rammeavtale.title && rammeavtale.reference && (
                            <Tag variant="neutral" size="small">
                              {rammeavtale.reference}
                            </Tag>
                          )}
                          {rammeavtale.agreementStatus === 'ACTIVE' ? (
                            <Tag variant="success">Aktiv</Tag>
                          ) : (
                            <Tag variant="warning">Inaktiv</Tag>
                          )}
                        </HStack>
                      </LinkPanel.Title>
                    </LinkPanel>
                  </>
                ))}
            </div>
          ) : (
            <div className="panel-list__container">
              {isLoading && <Loader size="3xlarge" title="venter..." />}
              {pagedData?.content && pagedData?.content.length === 0 && (
                <Alert variant="info">Ingen rammeavtaler funnet.</Alert>
              )}
              {pagedData?.content &&
                pagedData?.content.map((rammeavtale, i) => (
                  <LinkPanel
                    as={Link}
                    to={`/rammeavtaler/${rammeavtale.id}`}
                    className="panel-list__name-panel"
                    key={i}
                  >
                    <LinkPanel.Title className="panel-list__title panel-list__width">
                      <HStack gap="space-2 space-2" align="center">
                        <BodyShort> {rammeavtale.title || 'Ukjent produktnavn'} </BodyShort>
                        {rammeavtale.title && rammeavtale.reference && (
                          <Tag variant="neutral" size="small">
                            {rammeavtale.reference}
                          </Tag>
                        )}
                        {rammeavtale.agreementStatus === 'ACTIVE' ? (
                          <Tag variant="success">Aktiv</Tag>
                        ) : (
                          <Tag variant="warning">Inaktiv</Tag>
                        )}
                      </HStack>
                    </LinkPanel.Title>
                  </LinkPanel>
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
