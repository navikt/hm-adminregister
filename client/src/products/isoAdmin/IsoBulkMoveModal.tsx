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

import { bulkUpdateIso22Category } from './isoOversiktApi'
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
  // Kilden til produkt-/variantdata for denne v16-koden - kommer fra IsoOversikt sin allerede
  // innlastede `rows`-tilstand (samme data som driver Produkt/Variant-visningen og tellingene der),
  // IKKE et eget backend-kall filtrert på isoCode. Se IsoOversikt.tsx for begrunnelse.
  preloadedRows: ExtractedProductVariant[]
  rowsLoaded: boolean
  rowsLoading?: boolean
  onRequestLoadRows?: () => void
  onClose: () => void
  onCompleted: (attachedSeriesIds: string[], newIso22Code: string) => void
  onRequestVerify?: (mappingIds: string[], verified: boolean, context: { isoCode?: string }) => void
  verifying?: boolean
  // Åpner den frittstående CreateIso22CategoryModal som en 2. modal over denne - selve opprettelsen
  // (og tilkoblingen av mappingen til den nye kategorien) skjer der, ikke inline i denne modalen.
  onRequestCreateCategory?: (context: { parentIsoCode: string; parentIsoTitle?: string; mappingIds: string[] }) => void
}

const errorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error &&
    'errorDetail' in error &&
    typeof error.errorDetail === 'string' &&
    error.errorDetail
  ) {
    return error.errorDetail
  }
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'Noe gikk galt. Prøv igjen.'
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
  preloadedRows,
  rowsLoaded,
  rowsLoading,
  onRequestLoadRows,
  onClose,
  onCompleted,
  onRequestVerify,
  verifying,
  onRequestCreateCategory,
}: Props) => {
  // Målkategorien er låst til mappingens anbefalte v22 nivå 4-kode - admin skal ikke kunne søke opp
  // og velge en vilkårlig v22-kategori. Mangler nivå 4 enda, shortcuttes admin til den frittstående
  // CreateIso22CategoryModal (se onRequestCreateCategory) i stedet for en inline-oppretting her.
  const targetIso22Code = context?.iso22Lvl4 || ''
  const currentIso22Code = targetIso22Code || context?.iso22Lvl3 || ''

  const [previewPage, setPreviewPage] = useState(1)
  // Lokal, optimistisk overstyring av lagret v22-kode rett etter en vellykket tilknytning - slik at
  // admin ser oppdaterte statuser i tabellen umiddelbart, uten å vente på at `preloadedRows` fra
  // parent skal rekomputeres (som skjer via onCompleted, men kan ta et par render-sykluser).
  const [optimisticIso22, setOptimisticIso22] = useState<Record<string, string>>({})

  const [attaching, setAttaching] = useState(false)
  const [attachProgress, setAttachProgress] = useState<{ done: number; total: number } | null>(null)
  const [attachError, setAttachError] = useState<string | null>(null)

  // "Vis detaljer" gir full innsikt i v16- og v22-kategorien (tittel, forklaring, søkeord) side om
  // side, slik at man visuelt kan verifisere at riktig v22-kategori korresponderer med v16-koden
  // før og etter tilknytning - viktig fordi ren produktlisting alene ikke sier noe om kategoriens
  // faktiske innhold, kun koden.
  const [showDetails, setShowDetails] = useState(false)

  // Nye ISO v22-kategorier kan kun opprettes mens mappingen ikke er verifisert (se AksjonCell) -
  // dette hindrer at taxonomien endres "under" en godkjent v16->v22-migrering.
  const missingV22Level4 =
    !!context &&
    context.mappingAvailable &&
    !context.iso22Lvl4 &&
    !!context.iso22Lvl3 &&
    context.mappingVerified === false
  // Tilknytning til v22 er sperret mens raden er verifisert - man må fjerne verifiseringen først
  // (se AksjonCell). Å bla gjennom oversikten er fortsatt tillatt.
  const attachLocked = context?.mappingVerified === true

  useEffect(() => {
    if (!isOpen) return
    setAttachError(null)
    setAttachProgress(null)
    setPreviewPage(1)
    setShowDetails(false)
    setOptimisticIso22({})
  }, [isOpen, sourceIsoCode])

  const previewSeries = useMemo(() => {
    const base = buildPreviewSeries(preloadedRows)
    if (Object.keys(optimisticIso22).length === 0) return base
    return base.map((series) =>
      optimisticIso22[series.seriesId] ? { ...series, isoCode22: optimisticIso22[series.seriesId] } : series
    )
  }, [preloadedRows, optimisticIso22])

  const handleClose = () => {
    if (attaching) return
    onClose()
  }

  const handleAttach = async () => {
    if (attachLocked) return
    if (!targetIso22Code) return
    if (!previewSeries.length) return
    const newIso22Code = targetIso22Code
    const seriesIds = previewSeries.map((series) => series.seriesId)
    setAttaching(true)
    setAttachError(null)
    setAttachProgress({ done: 0, total: seriesIds.length })
    try {
      const result = await bulkUpdateIso22Category(seriesIds, newIso22Code, (done, total) =>
        setAttachProgress({ done, total })
      )
      if (result.failed.length > 0) {
        setAttachError(
          `${result.succeeded.length} av ${seriesIds.length} produkter ble koblet til. ${result.failed.length} feilet: ${result.failed
            .map((f) => f.error)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(', ')}`
        )
      }
      if (result.succeeded.length > 0) {
        onCompleted(result.succeeded, newIso22Code)
        // Oppdater forhåndsvisningen lokalt slik at admin kan verifisere tilknytningen visuelt
        // med en gang - uten dette ville tabellen fortsatt vist den gamle/manglende v22-koden
        // helt til `rows` i parent er rekomputert.
        setOptimisticIso22((prev) => {
          const next = { ...prev }
          for (const id of result.succeeded) next[id] = newIso22Code
          return next
        })
      }
      if (result.failed.length === 0) {
        onClose()
      }
    } catch (error) {
      setAttachError(errorMessage(error))
    } finally {
      setAttaching(false)
      setAttachProgress(null)
    }
  }

  const totalCount = previewSeries.length
  const attachedCount = previewSeries.filter((series) => !!series.isoCode22).length
  // "Riktig" tilknytning: produktet har en lagret v22-kode som stemmer med mappingens anbefalte
  // kode for denne v16-kategorien - brukes til å sperre "Verifiser" (se AksjonCell for samme regel).
  const correctlyAttachedCount = currentIso22Code
    ? previewSeries.filter((series) => series.isoCode22 === currentIso22Code).length
    : attachedCount
  const verifyAttachmentComplete = totalCount === 0 || correctlyAttachedCount === totalCount
  const previewTotalPages = Math.max(1, Math.ceil(totalCount / PREVIEW_PAGE_SIZE))
  const visibleSeries = previewSeries.slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE)

  return (
    <Modal
      open={isOpen}
      header={{
        heading: `Koble produkter fra ISO ${sourceIsoCode ?? ''} til en ISO v22-kategori`,
        closeButton: !attaching,
      }}
      onClose={handleClose}
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
                              disabled={!context.mappingVerified && !verifyAttachmentComplete}
                              onClick={() =>
                                onRequestVerify(context.mappingIds, !context.mappingVerified, {
                                  isoCode: sourceIsoCode ?? undefined,
                                })
                              }
                            >
                              {context.mappingVerified
                                ? 'Fjern verifisering'
                                : verifyAttachmentComplete
                                  ? 'Verifiser'
                                  : 'Verifiser (koble produkter til v22 først)'}
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
                            <BodyShort size="small" textColor="subtle">
                              Ingen nivå 4-kategori under {context.iso22Lvl3 || '(ukjent nivå 3)'} enda. Forklaring og
                              søkeord finnes først når en nivå 4-kategori opprettes.
                            </BodyShort>
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
                            {context.iso22Lvl3Title}). En nivå 4-kategori må opprettes før produktene kan kobles til
                            v22.
                          </BodyShort>
                          <Box>
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
                          </Box>
                        </VStack>
                      </Alert>
                    </Box>
                  )}
                </VStack>
              </Box>
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
                        Produktlisten er ikke lastet inn ennå. Last inn produkter og varianter for å se en korrekt
                        oversikt over hva som er tilknyttet ISO {sourceIsoCode}.
                      </BodyShort>
                      {onRequestLoadRows && (
                        <Button size="small" variant="secondary" onClick={onRequestLoadRows}>
                          Last inn produkter
                        </Button>
                      )}
                    </VStack>
                  </Alert>
                )}
              </HStack>
            )}
            {rowsLoaded && (
              <>
                <BodyShort>
                  <strong>{totalCount.toLocaleString('nb-NO')}</strong> produkt{totalCount === 1 ? '' : 'er'} er
                  registrert med ISO {sourceIsoCode} og vil bli koblet til valgt v22-kategori. v16-koden beholdes
                  uendret.
                </BodyShort>
                {totalCount > 0 && (
                  <BodyShort size="small" textColor="subtle">
                    {attachedCount} av {totalCount} produkt{totalCount === 1 ? '' : 'er'} har allerede en v22-kode
                    tilknyttet (se kolonnen &quot;v22-kode&quot; for detaljer per produkt).
                  </BodyShort>
                )}
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
                          <Table.HeaderCell scope="col">v22-kode</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {visibleSeries.map((series) => (
                          <Table.Row key={series.seriesId}>
                            <Table.DataCell>{series.productTitle}</Table.DataCell>
                            <Table.DataCell>{series.variantCount}</Table.DataCell>
                            <Table.DataCell>{series.hmsArtNr.join(', ')}</Table.DataCell>
                            <Table.DataCell>{series.isoCode || sourceIsoCode}</Table.DataCell>
                            <Table.DataCell>
                              {series.isoCode22 ? (
                                <Tag variant="success" size="small">
                                  {series.isoCode22}
                                </Tag>
                              ) : (
                                <Tag variant="neutral" size="small">
                                  Ikke koblet
                                </Tag>
                              )}
                            </Table.DataCell>
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

            {totalCount > 0 && attachLocked && (
              <Alert variant="warning">
                Denne ISO-mappingen er verifisert og må fjernes fra verifisering før produktene kan kobles til en annen
                v22-kategori.
              </Alert>
            )}

            {totalCount > 0 && !attachLocked && !verifyAttachmentComplete && (
              <Alert variant="info">
                {correctlyAttachedCount} av {totalCount} produkt{totalCount === 1 ? '' : 'er'} er koblet til riktig
                v22-kategori. Alle må være koblet til før mappingen kan verifiseres.
              </Alert>
            )}

            {totalCount > 0 && targetIso22Code && !attachLocked && (
              <Alert variant="info" size="small">
                Produktene vil bli koblet til ISO v22-kategori <strong>{targetIso22Code}</strong>
                {context?.iso22Lvl4Title ? ` - ${context.iso22Lvl4Title}` : ''}.
              </Alert>
            )}

            {attaching && (
              <HStack gap="space-8" align="center" role="status">
                <Loader size="small" title="Kobler til produkter" />
                <BodyShort>
                  Kobler til {attachProgress?.done ?? 0} av {attachProgress?.total ?? totalCount} produkter...
                </BodyShort>
              </HStack>
            )}
            {attachError && <Alert variant="error">{attachError}</Alert>}
          </VStack>
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={attaching}>
          Avbryt
        </Button>
        <Button
          onClick={handleAttach}
          variant="primary"
          loading={attaching}
          disabled={!totalCount || !rowsLoaded || attachLocked || !targetIso22Code}
        >
          Koble til {totalCount > 0 ? totalCount.toLocaleString('nb-NO') : ''} produkter
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default IsoBulkMoveModal
