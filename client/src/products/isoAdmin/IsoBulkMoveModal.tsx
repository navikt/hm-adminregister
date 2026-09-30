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

type PreviewSeriesRow = {
  seriesId: string
  productTitle: string
  variantCount: number
  hmsArtNr: string[]
  isoCode: string
  isoCode22: string
}

interface Props {
  isOpen: boolean
  sourceIsoCode: string | null
  context: MappingRow | null
  // Mappingens v22-mål på nivå 4 når kategorien finnes (se resolveIso22Targets). Tom når nivå 4 mangler.
  targetIso22Code: string
  // Produkt-/variantdata for denne v16-koden, fra oversiktens innlastede rader eller fra en
  // avgrenset innlasting for koden (se IsoOversikt.tsx).
  preloadedRows: ExtractedProductVariant[]
  rowsLoaded: boolean
  rowsLoading?: boolean
  rowsLoadError?: string | null
  onRequestLoadRows?: () => void
  onClose: () => void
  onRequestVerify?: (mappingIds: string[], verified: boolean, context: { isoCode?: string }) => void
  verifying?: boolean
  // Åpner den frittstående CreateIso22CategoryModal som en 2. modal over denne - selve opprettelsen
  // (og tilkoblingen av mappingen til den nye kategorien) skjer der, ikke inline i denne modalen.
  onRequestCreateCategory?: (context: { parentIsoCode: string; parentIsoTitle?: string; mappingIds: string[] }) => void
  onRequestCopyV16ToV22?: (context: { isoCode: string; mappingIds: string[]; iso22Lvl3?: string }) => void
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
        isoCode22: row.iso22Stored,
      })
    }
  }
  return Array.from(map.values())
}

const IsoBulkMoveModal = ({
  isOpen,
  sourceIsoCode,
  context,
  targetIso22Code,
  preloadedRows,
  rowsLoaded,
  rowsLoading,
  rowsLoadError,
  onRequestLoadRows,
  onClose,
  onRequestVerify,
  verifying,
  onRequestCreateCategory,
  onRequestCopyV16ToV22,
}: Props) => {
  const [previewPage, setPreviewPage] = useState(1)

  // "Vis detaljer" viser v16- og v22-kategorien (tittel, forklaring, søkeord) side om side, slik at
  // man kan kontrollere at mappingen er riktig før den verifiseres.
  const [showDetails, setShowDetails] = useState(false)

  // Nye ISO v22-kategorier kan kun opprettes mens mappingen ikke er verifisert (se AksjonCell) -
  // dette hindrer at taxonomien endres "under" en godkjent v16->v22-migrering. Bare v16-koder på
  // nivå 4 skal ha en v22-kategori på nivå 4, så andre nivåer varsles ikke.
  const isV16Level4 = sourceIsoCode?.replace(/\s/g, '').length === 8
  const missingV22Level4 =
    !!context &&
    isV16Level4 &&
    context.mappingAvailable &&
    !targetIso22Code &&
    !!context.iso22Lvl3 &&
    context.mappingVerified === false

  useEffect(() => {
    if (!isOpen) return
    setPreviewPage(1)
    setShowDetails(false)
  }, [isOpen, sourceIsoCode])

  const previewSeries = useMemo(() => buildPreviewSeries(preloadedRows), [preloadedRows])
  const totalCount = previewSeries.length
  const previewTotalPages = Math.max(1, Math.ceil(totalCount / PREVIEW_PAGE_SIZE))
  const visibleSeries = previewSeries.slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE)

  return (
    <Modal
      open={isOpen}
      header={{
        heading: `Oversikt over ISO ${sourceIsoCode ?? ''}`,
      }}
      onClose={onClose}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-16">
            {context && (
              <Box background="raised" padding="space-16" borderRadius="8">
                <VStack gap="space-8">
                  <HGrid columns={2} gap="space-8">
                    <VStack gap="space-2">
                      <BodyShort size="small" weight="semibold">
                        v16: {context.isoCode}
                      </BodyShort>
                      <BodyShort size="small">{context.iso4Title}</BodyShort>
                    </VStack>
                    <VStack gap="space-2">
                      <BodyShort size="small" weight="semibold">
                        v22: {context.iso22Lvl4 || context.iso22Lvl3 || 'Ingen kategori'}
                      </BodyShort>
                      <BodyShort size="small">{context.iso22Lvl4Title || context.iso22Lvl3Title}</BodyShort>
                    </VStack>
                  </HGrid>
                  <HStack gap="space-8" align="center" justify="space-between">
                    <HStack gap="space-8" align="center">
                      {context.mappingAvailable && context.mappingIds.length > 0 && (
                        <>
                          <Tag variant={context.mappingVerified ? 'success' : 'warning'} size="small">
                            {context.mappingVerified ? 'Verifisert' : 'Ikke verifisert'}
                          </Tag>
                          {onRequestVerify && (
                            <Button
                              variant="tertiary"
                              size="small"
                              loading={verifying}
                              onClick={() =>
                                onRequestVerify(context.mappingIds, !context.mappingVerified, {
                                  isoCode: sourceIsoCode ?? undefined,
                                })
                              }
                            >
                              {context.mappingVerified ? 'Fjern verifisering' : 'Verifiser'}
                            </Button>
                          )}
                        </>
                      )}
                    </HStack>
                    <Button variant="tertiary" size="small" onClick={() => setShowDetails((prev) => !prev)}>
                      {showDetails ? 'Skjul detaljer' : 'Vis detaljer'}
                    </Button>
                  </HStack>
                  {showDetails && (
                    <Box background="default" padding="space-12" borderRadius="8">
                      <HGrid columns={2} gap="space-16">
                        <VStack gap="space-4">
                          <BodyShort size="small" weight="semibold">
                            v16-kategori
                          </BodyShort>
                          <BodyShort size="small">Kode: {context.isoCode}</BodyShort>
                          <BodyShort size="small">Tittel: {context.iso4Title || 'Ingen tittel'}</BodyShort>
                          <BodyShort size="small">Forklaring: {context.iso4Text || 'Ingen forklaring'}</BodyShort>
                          <BodyShort size="small">Søkeord: {context.iso4SearchWords || 'Ingen søkeord'}</BodyShort>
                        </VStack>
                        <VStack gap="space-4">
                          <BodyShort size="small" weight="semibold">
                            v22-kategori
                          </BodyShort>
                          <BodyShort size="small">
                            Kode: {context.iso22Lvl4 || context.iso22Lvl3 || 'Ingen kategori'}
                          </BodyShort>
                          <BodyShort size="small">
                            Tittel: {context.iso22Lvl4Title || context.iso22Lvl3Title || 'Ingen tittel'}
                          </BodyShort>
                          {context.iso22Lvl4 ? (
                            <>
                              <BodyShort size="small">
                                Forklaring: {context.iso22Lvl4Text || 'Ingen forklaring'}
                              </BodyShort>
                              <BodyShort size="small">
                                Søkeord: {context.iso22Lvl4SearchWords || 'Ingen søkeord'}
                              </BodyShort>
                            </>
                          ) : (
                            isV16Level4 && (
                              <BodyShort size="small" textColor="subtle">
                                Ingen nivå 4-kategori under {context.iso22Lvl3 || '(ukjent nivå 3)'} enda. Forklaring og
                                søkeord finnes først når en nivå 4-kategori opprettes.
                              </BodyShort>
                            )
                          )}
                        </VStack>
                      </HGrid>
                    </Box>
                  )}
                  {missingV22Level4 && onRequestCreateCategory && (
                    <Box>
                      <Alert variant="warning" size="small">
                        <VStack gap="space-8">
                          <BodyShort size="small">
                            Det finnes ingen ISO v22-kategori på nivå 4 under {context.iso22Lvl3} (
                            {context.iso22Lvl3Title}). Opprett en nivå 4-kategori for å fullføre mappingen.
                          </BodyShort>
                          <HStack gap="space-8" wrap>
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() =>
                                onRequestCreateCategory({
                                  parentIsoCode: context.iso22Lvl3 as string,
                                  parentIsoTitle: context.iso22Lvl3Title,
                                  mappingIds: context.mappingIds,
                                })
                              }
                            >
                              Opprett ny ISO v22-kategori...
                            </Button>
                            {onRequestCopyV16ToV22 && (
                              <Button
                                size="small"
                                variant="secondary"
                                onClick={() =>
                                  onRequestCopyV16ToV22({
                                    isoCode: sourceIsoCode,
                                    mappingIds: context.mappingIds,
                                    iso22Lvl3: context.iso22Lvl3,
                                  })
                                }
                              >
                                Kopier v16 til v22 (nivå 4)
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      </Alert>
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
            {!rowsLoaded && (
              <HStack gap="space-8" align="center" role="status">
                {rowsLoadError && !rowsLoading ? (
                  <Alert variant="error" size="small">
                    <VStack gap="space-8">
                      <BodyShort size="small">
                        Klarte ikke å laste inn produkter for ISO {sourceIsoCode}: {rowsLoadError}
                      </BodyShort>
                      {onRequestLoadRows && (
                        <Button size="small" variant="secondary" onClick={onRequestLoadRows}>
                          Prøv igjen
                        </Button>
                      )}
                    </VStack>
                  </Alert>
                ) : (
                  <>
                    <Loader size="small" title="Henter produkter" />
                    <BodyShort>Henter produkter og varianter...</BodyShort>
                  </>
                )}
              </HStack>
            )}
            {rowsLoaded && (
              <>
                <BodyShort>
                  <strong>{totalCount.toLocaleString('nb-NO')}</strong> produkt{totalCount === 1 ? '' : 'er'} er
                  registrert med ISO {sourceIsoCode}.
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
      </Modal.Footer>
    </Modal>
  )
}

export default IsoBulkMoveModal
