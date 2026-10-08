import { useEffect, useMemo, useState } from 'react'

import Content from 'felleskomponenter/styledcomponents/Content'

import {
  Alert,
  BodyShort,
  Box,
  Button,
  HGrid,
  HStack,
  Loader,
  Modal,
  Pagination,
  Table,
  Tag,
  VStack,
} from '@navikt/ds-react'

import { ExtractedProductVariant, MappingRow } from './isoOversiktTypes'

const PREVIEW_PAGE_SIZE = 8

export type IsoCategoryDetails = {
  code: string
  title: string
  text: string
  searchWords: string
}

type CategoryCreationContext = {
  parentIsoCode: string
  parentIsoTitle?: string
  mappingIds: string[]
  targetIsoCode?: string
}

const DetailField = ({ label, value, emptyText }: { label: string; value?: string; emptyText: string }) => (
  <Box background="neutral-soft" padding="space-8" borderRadius="4">
    <BodyShort size="small" weight="semibold" textColor="subtle">
      {label}
    </BodyShort>
    <BodyShort size="small">{value || emptyText}</BodyShort>
  </Box>
)

const CategoryDetails = ({ heading, details }: { heading: string; details?: IsoCategoryDetails }) => (
  <VStack gap="space-8">
    <BodyShort size="small" weight="semibold">
      {heading}
    </BodyShort>
    <DetailField label="Kode" value={details?.code} emptyText="Ingen kategori" />
    <DetailField label="Tittel" value={details?.title} emptyText="Ingen tittel" />
    <DetailField label="Forklaring" value={details?.text} emptyText="Ingen forklaring" />
    <DetailField label="Søkeord" value={details?.searchWords} emptyText="Ingen søkeord" />
  </VStack>
)

type PreviewSeriesRow = {
  seriesId: string
  productTitle: string
  variantCount: number
  hmsArtNr: string[]
  isoCode: string
}

interface Props {
  context: MappingRow | null
  isOpen: boolean
  sourceIsoCode: string | null
  preloadedRows: ExtractedProductVariant[]
  rowsLoaded: boolean
  rowsLoading: boolean
  rowsLoadError: string | null
  onRequestLoadRows: () => void
  onClose: () => void
  onRequestVerify: (mappingIds: string[], verified: boolean, context: { isoCode?: string }) => void
  verifying: boolean
  v16Details?: IsoCategoryDetails
  v22Details?: IsoCategoryDetails
  verificationReady: boolean
  missingLevel4?: boolean
  onRequestCopyV16ToV22?: (context: CategoryCreationContext) => void
  creationContext?: CategoryCreationContext
  onRequestCreateCategory: (context: CategoryCreationContext) => void
}

const buildPreviewSeries = (rows: ExtractedProductVariant[]): PreviewSeriesRow[] => {
  const map = new Map<string, PreviewSeriesRow>()
  for (const row of rows) {
    const existing = map.get(row.seriesId)
    if (existing) {
      existing.variantCount++
      if (row.hmsArtNr) existing.hmsArtNr.push(row.hmsArtNr)
    } else {
      map.set(row.seriesId, {
        seriesId: row.seriesId,
        productTitle: row.productTitle,
        variantCount: 1,
        hmsArtNr: row.hmsArtNr ? [row.hmsArtNr] : [],
        isoCode: row.isoCode,
      })
    }
  }
  return Array.from(map.values())
}

const IsoBulkMoveModal = ({
  context,
  isOpen,
  sourceIsoCode,
  preloadedRows,
  rowsLoaded,
  rowsLoading,
  rowsLoadError,
  onRequestLoadRows,
  onClose,
  onRequestVerify,
  verifying,
  v16Details,
  v22Details,
  verificationReady,
  missingLevel4,
  onRequestCopyV16ToV22,
  creationContext,
  onRequestCreateCategory,
}: Props) => {
  const [previewPage, setPreviewPage] = useState(1)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setPreviewPage(1)
    setShowDetails(false)
  }, [isOpen, sourceIsoCode])

  const previewSeries = useMemo(() => buildPreviewSeries(preloadedRows), [preloadedRows])
  const totalCount = previewSeries.length
  const previewTotalPages = Math.max(1, Math.ceil(totalCount / PREVIEW_PAGE_SIZE))
  const visibleSeries = previewSeries.slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE)
  const mappingVerified = context?.mappingVerified === true
  const showMissingCategoryWarning =
    !!context && context.mappingAvailable && context.mappingIds.length > 0 && !mappingVerified && !verificationReady

  return (
    <Modal open={isOpen} header={{ heading: `Oversikt over ISO ${sourceIsoCode ?? ''}` }} onClose={onClose}>
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            {context && (
              <Box background="neutral-soft" padding="space-16" borderRadius="8">
                <VStack gap="space-8">
                  <HGrid columns={2} gap="space-8">
                    <VStack gap="space-2">
                      <BodyShort size="small" weight="semibold">
                        v16: {context.isoCode}
                      </BodyShort>
                      <BodyShort size="small">{v16Details?.title || context.iso4Title}</BodyShort>
                    </VStack>
                    <VStack gap="space-2">
                      <BodyShort size="small" weight="semibold">
                        v22: {context.iso22Lvl4 || context.iso22Lvl3 || 'Ingen kategori'}
                      </BodyShort>
                      <BodyShort size="small">
                        {v22Details?.title || context.iso22Lvl4Title || context.iso22Lvl3Title}
                      </BodyShort>
                    </VStack>
                  </HGrid>
                  {context.mappingAvailable && context.mappingIds.length > 0 && (
                    <HStack gap="space-8" align="center">
                      <BodyShort size="small" weight="semibold">
                        Mapping mellom v16 og v22
                      </BodyShort>
                      <Tag variant={mappingVerified ? 'success' : 'warning'} size="small">
                        {mappingVerified ? 'Verifisert' : 'Ikke verifisert'}
                      </Tag>
                    </HStack>
                  )}
                  <HStack justify="end">
                    <Button variant="tertiary" size="small" onClick={() => setShowDetails((prev) => !prev)}>
                      {showDetails ? 'Skjul detaljer' : 'Vis detaljer'}
                    </Button>
                  </HStack>
                  {showDetails && (
                    <Box background="neutral-soft" padding="space-12" borderRadius="8">
                      <HGrid columns={2} gap="space-16">
                        <CategoryDetails heading="v16-kategori" details={v16Details} />
                        <VStack gap="space-8">
                          <CategoryDetails heading="v22-kategori" details={v22Details} />
                          {!context.iso22Lvl4 && context.iso22Lvl3 && verificationReady && (
                            <VStack gap="space-8">
                              <BodyShort size="small" textColor="subtle">
                                Nivå 3-kategorien er et gyldig mål for mappingen. En nivå 4-kategori er ikke nødvendig
                                for verifisering.
                              </BodyShort>
                            </VStack>
                          )}
                        </VStack>
                      </HGrid>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}

            {missingLevel4 && (
              <Alert variant="warning" size="small">
                <VStack gap="space-8">
                  <BodyShort size="small">
                    V16-koden er på nivå 4, men tilsvarende v22-kategori på nivå 4 mangler.
                    {verificationReady ? ' Mappingens nivå 3-kategori er fortsatt gyldig for verifisering.' : ''}
                  </BodyShort>
                  {creationContext?.parentIsoCode.length === 6 && !mappingVerified && (
                    <HStack gap="space-8">
                      <Button size="small" variant="secondary" onClick={() => onRequestCreateCategory(creationContext)}>
                        Opprett nivå 4-kategori
                      </Button>
                      {onRequestCopyV16ToV22 && (
                        <Button size="small" variant="secondary" onClick={() => onRequestCopyV16ToV22(creationContext)}>
                          Kopier v16 til v22 (nivå 4)
                        </Button>
                      )}
                    </HStack>
                  )}
                </VStack>
              </Alert>
            )}

            {showMissingCategoryWarning && (
              <Alert variant="warning" size="small">
                <VStack gap="space-8">
                  <BodyShort size="small">
                    {creationContext?.targetIsoCode
                      ? `Mappingen peker på ISO v22-kode ${creationContext.targetIsoCode}, som mangler. Opprett kategorien før du verifiserer mappingen.`
                      : 'ISO v22-kategorien mappingen peker på, mangler på nivå 3 eller 4. Opprett kategorien før du verifiserer mappingen.'}
                  </BodyShort>
                  {creationContext && !(missingLevel4 && creationContext.parentIsoCode.length === 6) && (
                    <HStack gap="space-8">
                      <Button size="small" variant="secondary" onClick={() => onRequestCreateCategory(creationContext)}>
                        {creationContext.targetIsoCode
                          ? `Opprett ISO v22-kategori ${creationContext.targetIsoCode}`
                          : 'Opprett manglende kategori'}
                      </Button>
                      {onRequestCopyV16ToV22 &&
                        sourceIsoCode &&
                        sourceIsoCode.length >= creationContext.parentIsoCode.length + 2 && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => onRequestCopyV16ToV22(creationContext)}
                          >
                            Kopier v16 til v22 (nivå {creationContext.parentIsoCode.length / 2 + 1})
                          </Button>
                        )}
                    </HStack>
                  )}
                </VStack>
              </Alert>
            )}

            {!rowsLoaded && (
              <HStack gap="space-8" align="center" role="status">
                {rowsLoading ? (
                  <>
                    <Loader size="small" title="Henter produkter" />
                    <BodyShort>Henter produkter og varianter...</BodyShort>
                  </>
                ) : (
                  <Alert variant="info" size="small">
                    <VStack gap="space-8">
                      <BodyShort size="small">
                        Produktlisten er ikke lastet inn ennå. Last inn produktene som har ISO {sourceIsoCode} for å se
                        hva som er tilknyttet.
                      </BodyShort>
                      {rowsLoadError && <BodyShort size="small">{rowsLoadError}</BodyShort>}
                      <Button size="small" variant="secondary" onClick={onRequestLoadRows}>
                        Last inn produkter
                      </Button>
                    </VStack>
                  </Alert>
                )}
              </HStack>
            )}

            {rowsLoaded && (
              <>
                <BodyShort>
                  <strong>{totalCount.toLocaleString('nb-NO')}</strong> produkt{totalCount === 1 ? '' : 'er'} er
                  registrert med ISO {sourceIsoCode}. v16-koden beholdes uendret.
                </BodyShort>
                {totalCount === 0 ? (
                  <Alert variant="info">Ingen produkter er registrert med denne ISO-kategorien.</Alert>
                ) : (
                  <VStack gap="space-8">
                    <Table size="small" zebraStripes>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell scope="col">Produkt</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Ant. varianter</Table.HeaderCell>
                          <Table.HeaderCell scope="col">HMS-nr.</Table.HeaderCell>
                          <Table.HeaderCell scope="col">v16-kode</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {visibleSeries.map((series) => (
                          <Table.Row key={series.seriesId}>
                            <Table.DataCell>{series.productTitle}</Table.DataCell>
                            <Table.DataCell>{series.variantCount}</Table.DataCell>
                            <Table.DataCell>{series.hmsArtNr.join(', ')}</Table.DataCell>
                            <Table.DataCell>{series.isoCode || sourceIsoCode}</Table.DataCell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                    {previewTotalPages > 1 && (
                      <HStack justify="center">
                        <Pagination
                          page={previewPage}
                          onPageChange={setPreviewPage}
                          count={previewTotalPages}
                          size="small"
                          boundaryCount={1}
                          siblingCount={0}
                        />
                      </HStack>
                    )}
                  </VStack>
                )}
              </>
            )}
          </VStack>
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Lukk
        </Button>
        {context?.mappingAvailable && context.mappingIds.length > 0 && (
          <Button
            variant="primary"
            loading={verifying}
            disabled={!mappingVerified && !verificationReady}
            onClick={() =>
              onRequestVerify(context.mappingIds, !mappingVerified, { isoCode: sourceIsoCode ?? undefined })
            }
          >
            {mappingVerified ? 'Fjern verifisering' : 'Verifiser mappinger'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default IsoBulkMoveModal
