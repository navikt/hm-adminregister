import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { createIso22Category, updateIsoMapping } from 'api/IsoCategoryApi'
import { useAuthStore } from 'utils/store/useAuthStore'
import { useIsoCategories, useIsoCategories22, useIsoMappings } from 'utils/swr-hooks'
import { IsoMapDTO } from 'utils/types/response-types'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'
import {
  ActionMenu,
  Alert,
  BodyShort,
  Box,
  Button,
  Checkbox,
  ExpansionCard,
  HStack,
  Heading,
  HelpText,
  InfoCard,
  Loader,
  Modal,
  Pagination,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Table,
  Tag,
  TextField,
  VStack,
} from '@navikt/ds-react'

import CreateIso22CategoryModal, { CreateIso22CategoryContext } from './CreateIso22CategoryModal'
import iso9999Icon from './ISO9999-01.svg'
import IsoBulkMoveModal, { IsoCategoryDetails } from './IsoBulkMoveModal'
import styles from './IsoOversikt.module.scss'
import {
  AksjonCell,
  AksjonHeader,
  Iso22LevelCells,
  Iso22LevelHeaders,
  IsoLevelCells,
  IsoLevelHeaders,
  MappingTypes,
  MappingVerification,
  OptionalTitleCellsV1,
  OptionalTitleCellsV22,
  OptionalTitleHeadersV1,
  OptionalTitleHeadersV22,
  SortHeader,
} from './IsoTableCells'
import { extractErrorMessage } from './errorUtils'
import {
  buildMappingRows,
  buildMappingsByCode16,
  canVerifyMappings,
  getCategoryCreationContext,
  getMappedIso22Codes,
  mapToExtractedRows,
} from './isoMappingUtils'
import {
  SERIES_PAGE_SIZE,
  SERIES_WARN_THRESHOLD,
  fetchSeriesDetailsConcurrent,
  fetchSeriesPage,
} from './isoOversiktApi'
import {
  ExtraColumn,
  ExtractedProductVariant,
  OPTIONAL_ISO_LEVELS,
  OPTIONAL_TEXT_COLUMNS_V1,
  OPTIONAL_TEXT_COLUMNS_V22,
  OPTIONAL_TITLE_COLUMNS_V1,
  OPTIONAL_TITLE_COLUMNS_V22,
  OptionalColumnV1,
  OptionalColumnV22,
  OptionalIsoLevel,
  PageMode,
  ProductSummaryRow,
  SortDir,
  SortKey,
  ViewMode,
} from './isoOversiktTypes'
import { buildIso22Path, buildIsoPath } from './isoPathUtils'
import { groupByProduct } from './isoRowUtils'
import { compareIsoCodes, sortByIsoLevel, sortProductRows, sortRows } from './isoSortUtils'

type EditMode = 'les' | 'endre'

const toCategoryDetails = (
  category?: { isoCode: string; isoTitle: string; isoText?: string | null; searchWords?: string[] | null } | null
): IsoCategoryDetails | undefined =>
  category
    ? {
        code: category.isoCode,
        title: category.isoTitle,
        text: category.isoText ?? '',
        searchWords: (category.searchWords ?? []).join(', '),
      }
    : undefined

const IsoOversikt = () => {
  const { loggedInUser } = useAuthStore()
  const { isoCategories, isoLoading, isoError } = useIsoCategories()
  const { isoCategories22, isoLoading22, isoError22, mutateIsoCategories22 } = useIsoCategories22()
  const { isoMappings, isoMappingsLoading, isoMappingsError, mutateIsoMappings } = useIsoMappings(
    loggedInUser?.isAdmin === true
  )

  const [rows, setRows] = useState<ExtractedProductVariant[] | null>(null)
  // ISO-prefikset `rows` ble lastet for ('' = alle). `rows` kan være lastet for et annet filter enn det
  // som vises nå, så tilknytningsstatus for koder utenfor prefikset er ukjent.
  const [rowsScope, setRowsScope] = useState<string | null>(null)
  const [searchIso22, setSearchIso22] = useState(false)
  const [rowsVersion, setRowsVersion] = useState<'v16' | 'v22'>('v16')
  // Produkter hentet fra "Vis oversikt" for én bestemt v16-kode, uavhengig av sidefilteret. Holdes
  // utenfor `rows` slik at Produkt-/Variant-listen ikke viser et delvis uttrekk som om det var hele lista.
  const [scopedRows, setScopedRows] = useState<ExtractedProductVariant[]>([])
  const [loadedScopes, setLoadedScopes] = useState<string[]>([])
  const [scopeLoading, setScopeLoading] = useState(false)
  const [scopeLoadError, setScopeLoadError] = useState<string | null>(null)
  const [totalSeriesCount, setTotalSeriesCount] = useState<number | undefined>(undefined)
  const [pageLoading, setPageLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null)
  const [pendingLargeLoad, setPendingLargeLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const loadAbortControllerRef = useRef<AbortController | null>(null)

  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')

  const [sortKey, setSortKey] = useState<SortKey>('iso1')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [variantPage, setVariantPage] = useState(1)
  const [variantPageSize, setVariantPageSize] = useState(25)

  const [mappingPage, setMappingPage] = useState(1)
  const [mappingPageSize, setMappingPageSize] = useState(25)

  const [visibleOptionalsV1, setVisibleOptionalsV1] = useState<Set<OptionalColumnV1>>(new Set())
  const [visibleOptionalsV22, setVisibleOptionalsV22] = useState<Set<OptionalColumnV22>>(new Set())
  const [visibleIsoLevelsV1, setVisibleIsoLevelsV1] = useState<Set<OptionalIsoLevel>>(
    () => new Set(OPTIONAL_ISO_LEVELS)
  )
  const [visibleIsoLevelsV22, setVisibleIsoLevelsV22] = useState<Set<OptionalIsoLevel>>(
    () => new Set(OPTIONAL_ISO_LEVELS)
  )
  const [visibleExtraColumns, setVisibleExtraColumns] = useState<Set<ExtraColumn>>(new Set())
  const [showMappingTypes, setShowMappingTypes] = useState(false)
  const [showCounts, setShowCounts] = useState(false)
  const [onlyUnverified, setOnlyUnverified] = useState(false)
  const [unverifiedFirst, setUnverifiedFirst] = useState(false)
  const [otherOptionsOpen, setOtherOptionsOpen] = useState(false)
  const [pageMode, setPageMode] = useState<PageMode>('mapping')
  const [viewMode, setViewMode] = useState<ViewMode>('product')
  // Ett samlet visningsvalg for admin (radioknapper) - internt styrer det fortsatt de to separate
  // tilstandene pageMode/viewMode, siden resten av komponenten (paginering, filtrering, rendering)
  // allerede forgrener seg på disse.
  const displayMode: 'mapping' | ViewMode = pageMode === 'mapping' ? 'mapping' : viewMode
  const handleDisplayModeChange = (mode: 'mapping' | ViewMode) => {
    if (mode === 'mapping') {
      setPageMode('mapping')
    } else {
      setPageMode('extract')
      setViewMode(mode)
    }
    resetPaging()
  }
  const [isoInput, setIsoInput] = useState('')
  const [isoInputError, setIsoInputError] = useState<string | null>(null)

  const [editMode, setEditMode] = useState<EditMode>('les')
  const [verifyingMappingIds, setVerifyingMappingIds] = useState<Set<string>>(new Set())
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [bulkMoveModal, setBulkMoveModal] = useState<{ open: boolean; isoCode: string | null; mappingId?: string }>({
    open: false,
    isoCode: null,
  })
  const [verifyConfirm, setVerifyConfirm] = useState<{
    mappingIds: string[]
    verified: boolean
    seriesId?: string
    isoCode?: string
  } | null>(null)
  const [createCategoryContext, setCreateCategoryContext] = useState<CreateIso22CategoryContext | null>(null)

  const resetPaging = () => {
    setVariantPage(1)
    setMappingPage(1)
  }

  const sortedIsoCategories = useMemo(
    () => (isoCategories || []).filter((it) => it.isActive).sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories]
  )

  const sortedIsoCategories22 = useMemo(
    () => (isoCategories22 || []).slice().sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories22]
  )

  const mappingDataAvailable = !isoMappingsError
  const mappingsByCode16 = useMemo(() => buildMappingsByCode16(isoMappings || []), [isoMappings])
  const existingIso22Codes = useMemo(
    () => new Set((isoCategories22 || []).map((category) => category.isoCode)),
    [isoCategories22]
  )
  const isoMappingsById = useMemo(() => new Map((isoMappings || []).map((m) => [m.id, m])), [isoMappings])
  const verificationProgress = useMemo(() => {
    const mappings = isoMappings ?? []
    const summarize = (items: IsoMapDTO[]) => {
      const verified = items.filter((mapping) => mapping.verified).length
      return {
        total: items.length,
        verified,
        percentage: items.length ? Math.floor((verified * 100) / items.length) : 0,
      }
    }
    const groups = new Map<string, IsoMapDTO[]>()
    for (const mapping of mappings) {
      const prefix = mapping.code16?.replace(/\s/g, '').slice(0, 2) || ''
      const items = groups.get(prefix) ?? []
      items.push(mapping)
      groups.set(prefix, items)
    }
    return {
      ...summarize(mappings),
      groups: [...groups]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([prefix, items]) => ({
          prefix,
          ...summarize(items),
        })),
    }
  }, [isoMappings])
  const splitCodes = useMemo(
    () => new Set([...mappingsByCode16].filter(([, mappings]) => mappings.length > 1).map(([code]) => code)),
    [mappingsByCode16]
  )

  const isIsoCodeLoaded = useCallback(
    (isoCode: string) =>
      (rows !== null && rowsVersion === 'v16' && rowsScope !== null && isoCode.startsWith(rowsScope)) ||
      loadedScopes.some((scope) => isoCode.startsWith(scope)),
    [rows, rowsScope, rowsVersion, loadedScopes]
  )

  // Alle kjente produktrader: sidelista pluss rader hentet for enkeltkoder i oversikten.
  const knownRows = useMemo(() => {
    const scopedIds = new Set(scopedRows.map((row) => row.productId))
    const coveredByRows = (isoCode: string) =>
      rows !== null && rowsVersion === 'v16' && rowsScope !== null && isoCode.startsWith(rowsScope)
    return [
      ...(rows || []).filter((row) => rowsVersion === 'v16' || !scopedIds.has(row.productId)),
      ...scopedRows.filter((row) => !coveredByRows(row.isoCode)),
    ]
  }, [rows, rowsScope, rowsVersion, scopedRows])

  const updateKnownRows = useCallback((update: (current: ExtractedProductVariant[]) => ExtractedProductVariant[]) => {
    setRows((prev) => (prev ? update(prev) : null))
    setScopedRows((prev) => update(prev))
  }, [])

  const getAksjonTargetProps = useCallback(
    (_isoCode: string, mappingIds: string[]) => {
      const mappings = mappingIds.flatMap((id) => isoMappingsById.get(id) ?? [])
      return {
        verificationReady: mappings.length === mappingIds.length && canVerifyMappings(mappings, sortedIsoCategories22),
        creationContext: getCategoryCreationContext(mappings, sortedIsoCategories22),
      }
    },
    [isoMappingsById, sortedIsoCategories22]
  )

  // Antall produkter og varianter per v16-kode (eksakt kode, samme regel som i Vis oversikt), fra
  // allerede lastede rader. Ingen ekstra backend-kall.
  const countsByIsoCode = useMemo(() => {
    const seriesByCode = new Map<string, Set<string>>()
    const variantsByCode = new Map<string, number>()
    knownRows.forEach((row) => {
      const series = seriesByCode.get(row.isoCode) ?? new Set<string>()
      series.add(row.seriesId)
      seriesByCode.set(row.isoCode, series)
      variantsByCode.set(row.isoCode, (variantsByCode.get(row.isoCode) ?? 0) + 1)
    })
    return new Map(
      [...seriesByCode].map(([code, series]) => [
        code,
        { products: series.size, variants: variantsByCode.get(code) ?? 0 },
      ])
    )
  }, [knownRows])

  const handleToggleVerification = useCallback(
    async (mappingIds: string[], verified: boolean): Promise<boolean> => {
      const targets = mappingIds
        .map((id) => isoMappingsById.get(id))
        .filter((mapping): mapping is IsoMapDTO => !!mapping)
      if (!targets.length) return false
      setVerificationError(null)
      setVerifyingMappingIds((prev) => new Set([...prev, ...mappingIds]))
      try {
        const results = await Promise.allSettled(targets.map((mapping) => updateIsoMapping({ ...mapping, verified })))
        const updated = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
        const updatedById = new Map(updated.map((mapping) => [mapping.id, mapping]))
        mutateIsoMappings((current) => (current || []).map((mapping) => updatedById.get(mapping.id) ?? mapping), {
          revalidate: false,
        })
        updateKnownRows((current) =>
          current.map((row) =>
            row.mappingIds.some((id) => mappingIds.includes(id))
              ? {
                  ...row,
                  mappingVerified: row.mappingIds.every(
                    (id) => (updatedById.get(id) ?? isoMappingsById.get(id))?.verified === true
                  ),
                }
              : row
          )
        )
        const failures = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []))
        if (failures.length) {
          setVerificationError(
            `${updated.length} av ${targets.length} mappinger ble oppdatert. ${extractErrorMessage(failures[0])}`
          )
          return false
        }
        return true
      } catch (error) {
        setVerificationError(extractErrorMessage(error))
        return false
      } finally {
        setVerifyingMappingIds((prev) => {
          const next = new Set(prev)
          mappingIds.forEach((id) => next.delete(id))
          return next
        })
      }
    },
    [isoMappingsById, mutateIsoMappings, updateKnownRows]
  )

  const handleOpenBulkMove = useCallback((isoCode: string, mappingId?: string) => {
    setScopeLoadError(null)
    setBulkMoveModal({ open: true, isoCode, mappingId })
  }, [])

  const handleOpenCreateCategoryModal = useCallback((context: CreateIso22CategoryContext) => {
    setCreateCategoryContext(context)
  }, [])

  const verifyConfirmProductCount = useMemo(() => {
    if (!verifyConfirm?.isoCode || !isIsoCodeLoaded(verifyConfirm.isoCode)) return null
    return new Set(knownRows.filter((row) => row.isoCode === verifyConfirm.isoCode).map((row) => row.seriesId)).size
  }, [verifyConfirm, knownRows, isIsoCodeLoaded])

  const handleRequestVerify = useCallback(
    (mappingIds: string[], verified: boolean, context: { seriesId?: string; isoCode?: string }) => {
      if (verified && !getAksjonTargetProps(context.isoCode ?? '', mappingIds).verificationReady) {
        setVerificationError('Opprett v22-kategorien mappingen peker på før du verifiserer.')
        return
      }
      setVerificationError(null)
      setVerifyConfirm({ mappingIds, verified, seriesId: context.seriesId, isoCode: context.isoCode })
    },
    [getAksjonTargetProps]
  )

  const handleShowOverviewFromVerifyConfirm = useCallback(() => {
    if (!verifyConfirm) return
    const { isoCode } = verifyConfirm
    setVerifyConfirm(null)
    if (isoCode) {
      handleOpenBulkMove(isoCode, verifyConfirm.mappingIds.length === 1 ? verifyConfirm.mappingIds[0] : undefined)
    }
  }, [verifyConfirm, handleOpenBulkMove])

  const handleConfirmVerify = useCallback(async () => {
    if (!verifyConfirm) return
    const { mappingIds, verified } = verifyConfirm
    if (verified && !getAksjonTargetProps(verifyConfirm.isoCode ?? '', mappingIds).verificationReady) {
      setVerificationError('V22-kategorien mappingen peker på finnes ikke.')
      return
    }
    if (await handleToggleVerification(mappingIds, verified)) {
      setVerifyConfirm(null)
    }
  }, [verifyConfirm, handleToggleVerification, getAksjonTargetProps])

  const verifyConfirmBusy = !!verifyConfirm?.mappingIds.some((id) => verifyingMappingIds.has(id))

  // Koder opprettet i denne økten der mappingoppdateringen ennå ikke er fullført. Et nytt forsøk skal
  // da hoppe over opprettingen og bare oppdatere mappingene, i stedet for å bli stoppet som duplikat.
  const [pendingIso22Links, setPendingIso22Links] = useState<ReadonlySet<string>>(new Set())

  const handleCreateIso22Category = useCallback(
    async ({
      parentIsoCode,
      isoCode,
      isoTitle,
      isoText,
      searchWords,
      mappingIds,
    }: {
      parentIsoCode: string
      isoCode: string
      isoTitle: string
      isoText: string
      searchWords: string[]
      mappingIds: string[]
    }) => {
      const userName = loggedInUser?.userName || 'admin'
      const now = new Date().toISOString()
      const alreadyCreated = pendingIso22Links.has(isoCode)
      const level = isoCode.length / 2
      if (
        (level !== 3 && level !== 4) ||
        !sortedIsoCategories22.some((category) => category.isoCode.replace(/\s/g, '') === parentIsoCode)
      ) {
        throw new Error('Kategorien må være på nivå 3 eller 4 med en eksisterende forelder.')
      }
      if (!alreadyCreated) {
        await createIso22Category({
          id: crypto.randomUUID(),
          isoCode,
          isoTitle,
          isoText,
          level,
          isoTranslations: { titleEn: null, textEn: null },
          searchWords,
          isoType: level === 4 ? 'NAT' : 'ISO',
          createdByUser: userName,
          updatedByUser: userName,
          createdBy: 'REGISTER',
          updatedBy: 'REGISTER',
          created: now,
          updated: now,
        })
        // NB: `GET /admreg/api/v22/isocategories` (Iso22Service.retrieveAll) er cachet i minnet i
        // backend og lastes kun inn på nytt ved appstart - en revalidering her ville derfor IKKE
        // vist den nye kategorien før backend restartes. Vi slår i stedet den nye kategorien inn i
        // SWR-cachen lokalt (revalidate: false), slik at hovedtabellen viser den med en gang.
        const newCategory22 = {
          isoCode,
          isoTitle,
          isoText,
          isoTranslations: { titleEn: null, textEn: null },
          isoLevel: level,
          created: now,
          updated: now,
          searchWords,
        }
        mutateIsoCategories22(
          (current) => {
            const withoutDuplicate = (current || []).filter((category) => category.isoCode !== isoCode)
            return [...withoutDuplicate, newCategory22]
          },
          { revalidate: false }
        )
        setPendingIso22Links((prev) => new Set([...prev, isoCode]))
      }
      // Bare mappinger som peker på nivå 3-forelderen flyttes til den nye koden. Ved splitt skal de
      // andre målene for samme v16-kode stå urørt. Mappinger som allerede peker på koden (fra et
      // tidligere forsøk) hoppes over.
      const targets = mappingIds
        .map((id) => isoMappingsById.get(id))
        .filter((mapping): mapping is IsoMapDTO => !!mapping)
        .filter((mapping) => mapping.code22?.replace(/\s/g, '') === parentIsoCode)
      const results = await Promise.allSettled(
        targets.map((mapping) => updateIsoMapping({ ...mapping, code22: isoCode, level22: level }))
      )
      const updated = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
      if (updated.length) {
        const updatedById = new Map(updated.map((mapping) => [mapping.id, mapping]))
        mutateIsoMappings((current) => (current || []).map((mapping) => updatedById.get(mapping.id) ?? mapping), {
          revalidate: false,
        })
      }
      const failures = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []))
      if (failures.length) {
        throw new Error(
          `ISO ${isoCode} er opprettet, men ${failures.length} av ${targets.length} mapping${
            targets.length === 1 ? '' : 'er'
          } ble ikke koblet til: ${extractErrorMessage(failures[0])}. Prøv igjen for å fullføre koblingen.`
        )
      }
      setPendingIso22Links((prev) => {
        const next = new Set(prev)
        next.delete(isoCode)
        return next
      })
    },
    [
      loggedInUser?.userName,
      mutateIsoCategories22,
      isoMappingsById,
      mutateIsoMappings,
      pendingIso22Links,
      sortedIsoCategories22,
    ]
  )

  const createFormExistingIso22Codes = useMemo(
    () => new Set([...existingIso22Codes].filter((code) => !pendingIso22Links.has(code))),
    [existingIso22Codes, pendingIso22Links]
  )

  const selectedIsoCode = selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1
  const searchCategories = searchIso22 ? sortedIsoCategories22 : sortedIsoCategories
  const searchVersion = searchIso22 ? 'v22' : 'v16'

  const mappingRows = useMemo(
    () => buildMappingRows(sortedIsoCategories, sortedIsoCategories22, isoMappings || [], mappingDataAvailable),
    [sortedIsoCategories, sortedIsoCategories22, isoMappings, mappingDataAvailable]
  )

  // Ved splitt gjelder oversikten mappingraden den ble åpnet fra.
  const bulkMoveCandidates = useMemo(
    () => (bulkMoveModal.isoCode ? mappingRows.filter((row) => row.isoCode === bulkMoveModal.isoCode) : []),
    [mappingRows, bulkMoveModal.isoCode]
  )
  const bulkMoveContext = useMemo(() => {
    const { mappingId } = bulkMoveModal
    if (mappingId) return bulkMoveCandidates.find((row) => row.mappingIds.includes(mappingId)) ?? null
    const first = bulkMoveCandidates[0]
    if (!first) return null
    return {
      ...first,
      mappingIds: [...new Set(bulkMoveCandidates.flatMap((row) => row.mappingIds))],
      mappingVerified: bulkMoveCandidates.every((row) => row.mappingVerified === true),
      iso22Lvl3: [...new Set(bulkMoveCandidates.map((row) => row.iso22Lvl3).filter(Boolean))].join(', '),
      iso22Lvl4: [...new Set(bulkMoveCandidates.map((row) => row.iso22Lvl4).filter(Boolean))].join(', '),
    }
  }, [bulkMoveCandidates, bulkMoveModal])
  const bulkMoveV16Details = useMemo(
    () => toCategoryDetails(sortedIsoCategories.find((category) => category.isoCode === bulkMoveModal.isoCode)),
    [sortedIsoCategories, bulkMoveModal.isoCode]
  )
  const bulkMoveV22Details = useMemo(() => {
    if (!bulkMoveContext) return undefined
    const mappings = bulkMoveContext.mappingIds.flatMap((id) => isoMappingsById.get(id) ?? [])
    const codes = getMappedIso22Codes(bulkMoveContext.isoCode, mappings)
    const categories = codes.flatMap(
      (code) => sortedIsoCategories22.find((category) => category.isoCode === code) ?? []
    )
    if (!categories.length) return undefined
    return {
      code: codes.join(', '),
      title: categories.map((category) => category.isoTitle).join('; '),
      text: categories
        .map((category) => category.isoText)
        .filter(Boolean)
        .join('; '),
      searchWords: [...new Set(categories.flatMap((category) => category.searchWords ?? []))].join(', '),
    }
  }, [sortedIsoCategories22, bulkMoveContext, isoMappingsById])
  const bulkMoveSourceRows = useMemo(
    () => (bulkMoveModal.isoCode ? knownRows.filter((row) => row.isoCode === bulkMoveModal.isoCode) : []),
    [knownRows, bulkMoveModal.isoCode]
  )

  const filteredMappingRows = useMemo(() => {
    const visible = onlyUnverified ? mappingRows.filter((row) => row.mappingVerified !== true) : mappingRows
    const base = selectedIsoCode
      ? visible.filter((row) =>
          searchIso22
            ? [row.iso22Lvl1, row.iso22Lvl2, row.iso22Lvl3, row.iso22Lvl4].some((code) =>
                code?.split(',').some((value) => value.trim().startsWith(selectedIsoCode))
              )
            : row.isoCode.startsWith(selectedIsoCode)
        )
      : visible
    const sorted = selectedIsoCode
      ? [...base].sort((a, b) => compareIsoCodes(a.isoCode, b.isoCode, 'asc'))
      : sortByIsoLevel(base, sortKey, sortDir)
    return unverifiedFirst
      ? [...sorted].sort((a, b) => Number(a.mappingVerified === true) - Number(b.mappingVerified === true))
      : sorted
  }, [mappingRows, selectedIsoCode, searchIso22, sortKey, sortDir, onlyUnverified, unverifiedFirst])

  const mappingTotalPages = Math.max(1, Math.ceil(filteredMappingRows.length / mappingPageSize))
  const pagedMappingRows = useMemo(() => {
    const from = (mappingPage - 1) * mappingPageSize
    return filteredMappingRows.slice(from, from + mappingPageSize)
  }, [filteredMappingRows, mappingPage, mappingPageSize])

  useEffect(() => {
    if (mappingPage > mappingTotalPages) setMappingPage(mappingTotalPages)
  }, [mappingPage, mappingTotalPages])

  useEffect(() => () => loadAbortControllerRef.current?.abort(), [])

  const categoriesLoading = isoLoading || isoLoading22 || isoMappingsLoading

  const loadAllRows = useCallback(
    async (skipWarning = false) => {
      if (!loggedInUser?.isAdmin) return
      loadAbortControllerRef.current?.abort()
      const abortController = new AbortController()
      loadAbortControllerRef.current = abortController
      setPageLoading(true)
      setLoadError(null)
      setPendingLargeLoad(false)
      setLoadProgress(null)
      try {
        const firstChunk = await fetchSeriesPage(
          0,
          SERIES_PAGE_SIZE,
          selectedIsoCode,
          abortController.signal,
          searchVersion
        )
        const totalPages = firstChunk.totalPages || 1
        const totalSeries = firstChunk.totalSize ?? 0
        setTotalSeriesCount(totalSeries)

        if (!skipWarning && !selectedIsoCode && totalSeries > SERIES_WARN_THRESHOLD) {
          setPendingLargeLoad(true)
          setPageLoading(false)
          return
        }

        const series = [...(firstChunk.content || [])]
        for (let p = 1; p < totalPages; p++) {
          const chunk = await fetchSeriesPage(
            p,
            SERIES_PAGE_SIZE,
            selectedIsoCode,
            abortController.signal,
            searchVersion
          )
          series.push(...(chunk.content || []))
        }
        const hasIsoOverview = series.every(
          (seriesItem) => typeof seriesItem.isoCategory === 'string' && Array.isArray(seriesItem.variants)
        )
        if (!hasIsoOverview) setLoadProgress({ loaded: 0, total: series.length })
        const details = hasIsoOverview
          ? series
          : await fetchSeriesDetailsConcurrent(
              series.map((seriesItem) => seriesItem.id),
              (loaded, total) => setLoadProgress({ loaded, total }),
              abortController.signal
            )
        abortController.signal.throwIfAborted()
        setRows(
          mapToExtractedRows(
            details,
            sortedIsoCategories,
            sortedIsoCategories22,
            mappingsByCode16,
            mappingDataAvailable
          )
        )
        setRowsScope(selectedIsoCode || '')
        setRowsVersion(searchVersion)
        setVariantPage(1)
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setLoadError(error instanceof Error ? error.message : 'Klarte ikke å hente produkter og varianter')
        }
      } finally {
        if (loadAbortControllerRef.current === abortController) {
          loadAbortControllerRef.current = null
          setPageLoading(false)
          setLoadProgress(null)
        }
      }
    },
    [
      loggedInUser?.isAdmin,
      sortedIsoCategories,
      sortedIsoCategories22,
      mappingsByCode16,
      selectedIsoCode,
      searchVersion,
      mappingDataAvailable,
    ]
  )

  // "Last inn produkter" i oversikten: henter kun produktene for oversiktens egen v16-kode
  // (isoCode-filter i backend), uavhengig av sidefilteret og uten å røre Produkt-/Variant-lista.
  const loadRowsForIsoCode = useCallback(
    async (isoCode: string) => {
      setScopeLoading(true)
      setScopeLoadError(null)
      const abortController = new AbortController()
      try {
        const firstChunk = await fetchSeriesPage(0, SERIES_PAGE_SIZE, isoCode, abortController.signal)
        const series = [...(firstChunk.content || [])]
        for (let page = 1; page < (firstChunk.totalPages || 1); page++) {
          const chunk = await fetchSeriesPage(page, SERIES_PAGE_SIZE, isoCode, abortController.signal)
          series.push(...(chunk.content || []))
        }
        const hasIsoOverview = series.every(
          (seriesItem) => typeof seriesItem.isoCategory === 'string' && Array.isArray(seriesItem.variants)
        )
        const details = hasIsoOverview
          ? series
          : await fetchSeriesDetailsConcurrent(
              series.map((seriesItem) => seriesItem.id),
              () => {},
              abortController.signal
            )
        const newRows = mapToExtractedRows(
          details,
          sortedIsoCategories,
          sortedIsoCategories22,
          mappingsByCode16,
          mappingDataAvailable
        )
        setScopedRows((prev) => [...prev.filter((row) => !row.isoCode.startsWith(isoCode)), ...newRows])
        setLoadedScopes((prev) => (prev.includes(isoCode) ? prev : [...prev, isoCode]))
      } catch (error) {
        setScopeLoadError(extractErrorMessage(error, 'Klarte ikke å hente produkter'))
      } finally {
        setScopeLoading(false)
      }
    },
    [sortedIsoCategories, sortedIsoCategories22, mappingsByCode16, mappingDataAvailable]
  )

  useEffect(() => {
    if (pageMode !== 'extract' || !selectedIsoCode || !pendingLargeLoad || pageLoading) return
    void loadAllRows(true)
  }, [pageMode, selectedIsoCode, pendingLargeLoad, pageLoading, loadAllRows])

  // Forhåndshenter produkt-/variantdata i bakgrunnen mens admin fortsatt ser "Ren ISO-mapping" -
  // slik unngås en eksplisitt "Hent liste"-klikk når man bytter til Produkt- eller Variant-visning.
  // Kjøres kun én gang, og kun når datasettet er innenfor SERIES_WARN_THRESHOLD (loadAllRows setter
  // da pendingLargeLoad i stedet for å laste alt) - store, ufiltrerte uttrekk krever fortsatt et
  // eksplisitt admin-samtykke via "Fortsett likevel".
  // Når antall-kolonnen slås på i Ren ISO-mapping, kjøres samme henting som "Hent liste" (den knappen
  // finnes bare i Produkt/Variant). Med ISO-filter hentes bare filteret. Uten filter vises vanlig
  // advarsel ved store uttrekk. Hvert omfang forsøkes én gang, så "Avbryt" ikke trigger ny henting.
  const countLoadAttemptedScopeRef = useRef<string | null>(null)
  useEffect(() => {
    if (!showCounts) {
      countLoadAttemptedScopeRef.current = null
      return
    }
    if (pageMode !== 'mapping' || categoriesLoading || pageLoading) return
    if (pendingLargeLoad && !selectedIsoCode) {
      countLoadAttemptedScopeRef.current = `${searchVersion}:`
      return
    }
    const scope = `${searchVersion}:${selectedIsoCode}`
    const covered =
      rows !== null && rowsVersion === searchVersion && rowsScope !== null && selectedIsoCode.startsWith(rowsScope)
    if (covered || countLoadAttemptedScopeRef.current === scope) return
    countLoadAttemptedScopeRef.current = scope
    void loadAllRows(false)
  }, [
    showCounts,
    pageMode,
    categoriesLoading,
    pageLoading,
    pendingLargeLoad,
    selectedIsoCode,
    rows,
    rowsScope,
    rowsVersion,
    searchVersion,
    loadAllRows,
  ])

  const backgroundPrefetchAttemptedRef = useRef(false)
  useEffect(() => {
    if (
      backgroundPrefetchAttemptedRef.current ||
      !loggedInUser?.isAdmin ||
      categoriesLoading ||
      rows !== null ||
      pageLoading
    ) {
      return
    }
    backgroundPrefetchAttemptedRef.current = true
    void loadAllRows(false)
  }, [loggedInUser?.isAdmin, categoriesLoading, rows, pageLoading, loadAllRows])

  const level1Options = useMemo(() => searchCategories.filter((it) => it.isoLevel === 1), [searchCategories])
  const level2Options = useMemo(
    () =>
      selectedLevel1 ? searchCategories.filter((it) => it.isoLevel === 2 && it.isoCode.startsWith(selectedLevel1)) : [],
    [selectedLevel1, searchCategories]
  )
  const level3Options = useMemo(
    () =>
      selectedLevel2 ? searchCategories.filter((it) => it.isoLevel === 3 && it.isoCode.startsWith(selectedLevel2)) : [],
    [selectedLevel2, searchCategories]
  )
  const level4Options = useMemo(
    () =>
      selectedLevel3 ? searchCategories.filter((it) => it.isoLevel === 4 && it.isoCode.startsWith(selectedLevel3)) : [],
    [selectedLevel3, searchCategories]
  )

  const filteredRows = useMemo(() => {
    if (!rows) return []
    if (rowsVersion !== searchVersion) return []
    const base = selectedIsoCode
      ? rows.filter((row) => (searchIso22 ? row.iso22Stored : row.isoCode).startsWith(selectedIsoCode))
      : rows
    return sortRows(base, sortKey, sortDir)
  }, [rows, selectedIsoCode, searchIso22, rowsVersion, searchVersion, sortKey, sortDir])

  const productRows = useMemo(
    () => sortProductRows(groupByProduct(filteredRows), sortKey, sortDir),
    [filteredRows, sortKey, sortDir]
  )

  const displayCount = viewMode === 'product' ? productRows.length : filteredRows.length
  const totalPages = Math.max(1, Math.ceil(displayCount / variantPageSize))
  const pagedRows = useMemo(() => {
    const from = (variantPage - 1) * variantPageSize
    return viewMode === 'product'
      ? productRows.slice(from, from + variantPageSize)
      : filteredRows.slice(from, from + variantPageSize)
  }, [viewMode, filteredRows, productRows, variantPage, variantPageSize])

  useEffect(() => {
    if (variantPage > totalPages) setVariantPage(totalPages)
  }, [variantPage, totalPages])

  const applyIsoCodeInput = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      setSelectedLevel1('')
      setSelectedLevel2('')
      setSelectedLevel3('')
      setSelectedLevel4('')
      setIsoInputError(null)
      return
    }
    const stripped = trimmed.replace(/\s/g, '')
    const match = searchCategories.find((cat) => cat.isoCode.replace(/\s/g, '') === stripped)
    if (match) {
      setIsoInput(match.isoCode)
      const path = searchIso22
        ? buildIso22Path(match.isoCode, sortedIsoCategories22)
        : buildIsoPath(match.isoCode, sortedIsoCategories)
      setSelectedLevel1(path.level1?.isoCode ?? '')
      setSelectedLevel2(path.level2?.isoCode ?? '')
      setSelectedLevel3(path.level3?.isoCode ?? '')
      setSelectedLevel4(path.level4?.isoCode ?? '')
      setIsoInputError(null)
      resetPaging()
    } else {
      setIsoInputError(`ISO-kode "${trimmed}" ble ikke funnet`)
    }
  }

  const syncDropdownsToInput = (level1: string, level2: string, level3: string, level4: string) => {
    const code = level4 || level3 || level2 || level1
    setIsoInput(code)
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    resetPaging()
  }

  const toggleOptionalV1 = (col: OptionalColumnV1) => {
    setVisibleOptionalsV1((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const toggleOptionalV22 = (col: OptionalColumnV22) => {
    setVisibleOptionalsV22((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const toggleExtraColumn = (col: ExtraColumn) => {
    setVisibleExtraColumns((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const toggleIsoLevel = (
    level: OptionalIsoLevel,
    setVisibleLevels: Dispatch<SetStateAction<Set<OptionalIsoLevel>>>
  ) => {
    setVisibleLevels((current) => {
      const next = new Set(current)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const resetFilters = () => {
    setIsoInput('')
    setIsoInputError(null)
    setSelectedLevel1('')
    setSelectedLevel2('')
    setSelectedLevel3('')
    setSelectedLevel4('')
    resetPaging()
  }

  const cancelLoad = () => {
    loadAbortControllerRef.current?.abort()
    loadAbortControllerRef.current = null
    setPageLoading(false)
    setLoadProgress(null)
  }

  const largeLoadWarning = pendingLargeLoad && !selectedIsoCode && (
    <Alert variant="warning">
      Systemet inneholder <strong>{totalSeriesCount}</strong> aktive produktserier på tvers av alle ISO-kategorier. Uten
      ISO-filter vil alle hentes, noe som kan ta lang tid eller feile. Velg ISO-filter ovenfor for å begrense uttrekket,
      eller fortsett likevel.
      <HStack gap="space-8" style={{ marginTop: '0.75rem' }}>
        <Button size="small" variant="secondary" onClick={() => loadAllRows(true)}>
          Fortsett likevel
        </Button>
        <Button size="small" variant="tertiary" onClick={() => setPendingLargeLoad(false)}>
          Avbryt
        </Button>
      </HStack>
    </Alert>
  )

  if (isoError) {
    return (
      <main className="show-menu">
        <Alert variant="error">Klarte ikke å hente v16-kategorier.</Alert>
      </main>
    )
  }

  if (!loggedInUser?.isAdmin) {
    return (
      <main className="show-menu">
        <Alert variant="warning">Du må være admin for å se denne siden.</Alert>
      </main>
    )
  }

  return (
    <main className="show-menu">
      <VStack gap="space-12" maxWidth="100rem">
        <HStack gap="space-12" align="center" wrap>
          <img src={iso9999Icon} alt="" aria-hidden width={48} height={48} />
          <Heading level="1" size="large">
            ISO Admin
          </Heading>
        </HStack>
        <IsoBulkMoveModal
          isOpen={bulkMoveModal.open}
          sourceIsoCode={bulkMoveModal.isoCode}
          context={bulkMoveContext}
          verificationReady={
            bulkMoveContext
              ? getAksjonTargetProps(bulkMoveContext.isoCode, bulkMoveContext.mappingIds).verificationReady
              : false
          }
          creationContext={
            bulkMoveContext
              ? getAksjonTargetProps(bulkMoveContext.isoCode, bulkMoveContext.mappingIds).creationContext
              : undefined
          }
          preloadedRows={bulkMoveSourceRows}
          rowsLoaded={!!bulkMoveModal.isoCode && isIsoCodeLoaded(bulkMoveModal.isoCode)}
          rowsLoading={pageLoading || scopeLoading}
          rowsLoadError={scopeLoadError}
          onRequestLoadRows={() => {
            if (bulkMoveModal.isoCode) void loadRowsForIsoCode(bulkMoveModal.isoCode)
          }}
          onClose={() => setBulkMoveModal({ open: false, isoCode: null })}
          onRequestVerify={handleRequestVerify}
          verifying={bulkMoveContext ? bulkMoveContext.mappingIds.some((id) => verifyingMappingIds.has(id)) : false}
          onRequestCreateCategory={handleOpenCreateCategoryModal}
          v16Details={bulkMoveV16Details}
          v22Details={bulkMoveV22Details}
        />
        <CreateIso22CategoryModal
          context={createCategoryContext}
          onClose={() => setCreateCategoryContext(null)}
          onCreate={handleCreateIso22Category}
          existingIsoCodes={createFormExistingIso22Codes}
        />
        {verifyConfirm && (
          <Modal
            open
            header={{ heading: verifyConfirm.verified ? 'Bekreft verifisering' : 'Bekreft fjerning av verifisering' }}
            onClose={() => setVerifyConfirm(null)}
          >
            <Modal.Body>
              <BodyShort>
                {verifyConfirm.verified
                  ? 'Vil du verifisere mappingen mellom v16 og v22? Du bekrefter at v22-kategorien finnes og er riktig for denne mappingen. Produktene endres ikke.'
                  : 'Vil du fjerne verifiseringen for denne ISO-mappingen? Den vil da vises som ikke verifisert igjen.'}
              </BodyShort>
              {verifyConfirm.isoCode && (
                <BodyShort size="small" textColor="subtle">
                  Gjelder mappingen for v16-kode {verifyConfirm.isoCode}
                  {verifyConfirmProductCount !== null
                    ? ` (${verifyConfirmProductCount} produkt${verifyConfirmProductCount === 1 ? '' : 'er'})`
                    : ''}
                  , ikke bare ett enkelt produkt.
                </BodyShort>
              )}
              {verificationError && (
                <Alert variant="error" size="small" role="alert">
                  {verificationError}
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setVerifyConfirm(null)}>
                Avbryt
              </Button>
              <Button variant="primary" onClick={handleConfirmVerify} loading={verifyConfirmBusy}>
                {verifyConfirm.verified ? 'Verifiser' : 'Fjern verifisering'}
              </Button>
              {/* "Vis oversikt" er overflødig når dialogen ble åpnet fra innsiden av oversiktsmodalen selv */}
              {!(verifyConfirm.isoCode && bulkMoveModal.open && bulkMoveModal.isoCode === verifyConfirm.isoCode) &&
                (verifyConfirm.seriesId || verifyConfirm.isoCode) && (
                  <Button variant="tertiary" onClick={handleShowOverviewFromVerifyConfirm}>
                    Vis oversikt
                  </Button>
                )}
            </Modal.Footer>
          </Modal>
        )}
        <InfoCard data-color="warning">
          <InfoCard.Header>
            <InfoCard.Title>Obs!</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Fase 2 testes: Du kan se produkter med v16- og v22-koder, opprette v22-kategorier og verifisere mappinger.
            Forbedringer kan komme.
          </InfoCard.Content>
        </InfoCard>
        {isoError22 && <Alert variant="warning">Klarte ikke å hente v22-kategorier.</Alert>}
        {isoMappingsError && <Alert variant="warning">Klarte ikke å hente mapping-status mellom v16 og v22.</Alert>}

        <ExpansionCard defaultOpen size="small" aria-label="Filtre og visningsvalg">
          <ExpansionCard.Header>
            <ExpansionCard.Title size="small">Filtre og visningsvalg</ExpansionCard.Title>
          </ExpansionCard.Header>
          <ExpansionCard.Content>
            <VStack gap="space-12">
              <HStack gap="space-12" align="end" wrap className={styles.controlRow}>
                <RadioGroup
                  legend="Visningsmodus"
                  value={displayMode}
                  onChange={(val) => handleDisplayModeChange(val as 'mapping' | ViewMode)}
                  size="small"
                >
                  <HStack gap="space-24" wrap={false}>
                    <Radio value="mapping">Ren ISO-mapping</Radio>
                    <Radio value="product">Produkt</Radio>
                    <Radio value="variant">Variant</Radio>
                  </HStack>
                </RadioGroup>
                <ActionMenu open={otherOptionsOpen} onOpenChange={setOtherOptionsOpen}>
                  <ActionMenu.Trigger>
                    <Button
                      variant="secondary"
                      data-color="neutral"
                      size="small"
                      className={styles.otherOptionsButton}
                      icon={otherOptionsOpen ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                      iconPosition="right"
                    >
                      Vise/skjule kolonner
                    </Button>
                  </ActionMenu.Trigger>
                  <ActionMenu.Content>
                    <div className={styles.optionColumns}>
                      <div className={styles.optionColumn}>
                        <ActionMenu.Group label="v16-koder">
                          {OPTIONAL_ISO_LEVELS.map((level) => (
                            <ActionMenu.CheckboxItem
                              key={level}
                              checked={visibleIsoLevelsV1.has(level)}
                              onCheckedChange={() => toggleIsoLevel(level, setVisibleIsoLevelsV1)}
                            >
                              v16 nivå {level} kode
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                        <ActionMenu.Group label="v16-titler">
                          {OPTIONAL_TITLE_COLUMNS_V1.map((col) => (
                            <ActionMenu.CheckboxItem
                              key={col}
                              checked={visibleOptionalsV1.has(col)}
                              onCheckedChange={() => toggleOptionalV1(col)}
                            >
                              {col}
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                        <ActionMenu.Group label="v16-annet">
                          {OPTIONAL_TEXT_COLUMNS_V1.map((col) => (
                            <ActionMenu.CheckboxItem
                              key={col}
                              checked={visibleOptionalsV1.has(col)}
                              onCheckedChange={() => toggleOptionalV1(col)}
                            >
                              {col}
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                      </div>
                      <div className={styles.optionColumn}>
                        <ActionMenu.Group label="v22-koder">
                          {OPTIONAL_ISO_LEVELS.map((level) => (
                            <ActionMenu.CheckboxItem
                              key={level}
                              checked={visibleIsoLevelsV22.has(level)}
                              onCheckedChange={() => toggleIsoLevel(level, setVisibleIsoLevelsV22)}
                            >
                              v22 nivå {level} kode
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                        <ActionMenu.Group label="v22-titler">
                          {OPTIONAL_TITLE_COLUMNS_V22.map((col) => (
                            <ActionMenu.CheckboxItem
                              key={col}
                              checked={visibleOptionalsV22.has(col)}
                              onCheckedChange={() => toggleOptionalV22(col)}
                            >
                              {col}
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                        <ActionMenu.Group label="v22-annet">
                          {OPTIONAL_TEXT_COLUMNS_V22.map((col) => (
                            <ActionMenu.CheckboxItem
                              key={col}
                              checked={visibleOptionalsV22.has(col)}
                              onCheckedChange={() => toggleOptionalV22(col)}
                            >
                              {col}
                            </ActionMenu.CheckboxItem>
                          ))}
                        </ActionMenu.Group>
                      </div>
                    </div>
                    {pageMode === 'mapping' && (
                      <ActionMenu.Group label="Flere kolonner">
                        <ActionMenu.CheckboxItem
                          checked={showCounts}
                          onCheckedChange={() => setShowCounts((current) => !current)}
                        >
                          Antall produkter / varianter
                        </ActionMenu.CheckboxItem>
                      </ActionMenu.Group>
                    )}
                    {pageMode === 'extract' && (
                      <>
                        <ActionMenu.Group label="Mapping">
                          <ActionMenu.CheckboxItem
                            checked={showMappingTypes}
                            onCheckedChange={() => setShowMappingTypes((current) => !current)}
                          >
                            Endringstype og verifisering
                          </ActionMenu.CheckboxItem>
                        </ActionMenu.Group>
                        <ActionMenu.Group label="Flere kolonner">
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('produkt')}
                            onCheckedChange={() => toggleExtraColumn('produkt')}
                          >
                            Produktnavn
                          </ActionMenu.CheckboxItem>
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('variant')}
                            onCheckedChange={() => toggleExtraColumn('variant')}
                          >
                            Variantnavn
                          </ActionMenu.CheckboxItem>
                          <ActionMenu.CheckboxItem
                            checked={visibleExtraColumns.has('avtale')}
                            onCheckedChange={() => toggleExtraColumn('avtale')}
                          >
                            Avtaleinfo
                          </ActionMenu.CheckboxItem>
                        </ActionMenu.Group>
                      </>
                    )}
                  </ActionMenu.Content>
                </ActionMenu>
                <Box marginInline="space-12 space-0">
                  <TextField
                    label={`ISO-kode (${searchVersion})`}
                    placeholder="2 til 8 siffer, for eksempel 18 el. 1809 el. 180903 el. 18090301"
                    size="small"
                    value={isoInput}
                    onChange={(e) => {
                      setIsoInput(e.target.value)
                      setIsoInputError(null)
                    }}
                    onBlur={(e) => applyIsoCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyIsoCodeInput(isoInput)
                    }}
                    error={isoInputError ?? undefined}
                    style={{ width: '28rem' }}
                  />
                </Box>
                <Checkbox
                  size="small"
                  checked={searchIso22}
                  onChange={(event) => {
                    cancelLoad()
                    resetFilters()
                    setSearchIso22(event.target.checked)
                    setPendingLargeLoad(false)
                  }}
                >
                  Søk v22-koder
                </Checkbox>
                {selectedIsoCode && (
                  <BodyShort size="small">
                    Valgt {searchVersion}-kode: {selectedIsoCode}
                  </BodyShort>
                )}
              </HStack>

              <HStack gap="space-8" align="end" wrap>
                <Select
                  label={`${searchVersion} nivå 1`}
                  size="small"
                  value={selectedLevel1}
                  onChange={(e) => {
                    setSelectedLevel1(e.target.value)
                    setSelectedLevel2('')
                    setSelectedLevel3('')
                    setSelectedLevel4('')
                    resetPaging()
                    syncDropdownsToInput(e.target.value, '', '', '')
                  }}
                >
                  <option value="">Alle</option>
                  {level1Options.map((o) => (
                    <option key={o.isoCode} value={o.isoCode}>
                      {o.isoCode} {o.isoTitle}
                    </option>
                  ))}
                </Select>

                <Select
                  label={`${searchVersion} nivå 2`}
                  size="small"
                  value={selectedLevel2}
                  disabled={!selectedLevel1}
                  onChange={(e) => {
                    setSelectedLevel2(e.target.value)
                    setSelectedLevel3('')
                    setSelectedLevel4('')
                    resetPaging()
                    syncDropdownsToInput(selectedLevel1, e.target.value, '', '')
                  }}
                >
                  <option value="">Alle</option>
                  {level2Options.map((o) => (
                    <option key={o.isoCode} value={o.isoCode}>
                      {o.isoCode} {o.isoTitle}
                    </option>
                  ))}
                </Select>

                <Select
                  label={`${searchVersion} nivå 3`}
                  size="small"
                  value={selectedLevel3}
                  disabled={!selectedLevel2}
                  onChange={(e) => {
                    setSelectedLevel3(e.target.value)
                    setSelectedLevel4('')
                    resetPaging()
                    syncDropdownsToInput(selectedLevel1, selectedLevel2, e.target.value, '')
                  }}
                >
                  <option value="">Alle</option>
                  {level3Options.map((o) => (
                    <option key={o.isoCode} value={o.isoCode}>
                      {o.isoCode} {o.isoTitle}
                    </option>
                  ))}
                </Select>

                <Select
                  label={`${searchVersion} nivå 4`}
                  size="small"
                  value={selectedLevel4}
                  disabled={!selectedLevel3}
                  onChange={(e) => {
                    setSelectedLevel4(e.target.value)
                    resetPaging()
                    syncDropdownsToInput(selectedLevel1, selectedLevel2, selectedLevel3, e.target.value)
                  }}
                >
                  <option value="">Alle</option>
                  {level4Options.map((o) => (
                    <option key={o.isoCode} value={o.isoCode}>
                      {o.isoCode} {o.isoTitle}
                    </option>
                  ))}
                </Select>

                <Button variant="secondary" size="small" onClick={resetFilters}>
                  Nullstill
                </Button>
                {pageMode === 'extract' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => loadAllRows(false)}
                      disabled={!sortedIsoCategories.length || pageLoading || categoriesLoading}
                    >
                      Hent liste
                    </Button>
                    {pageLoading && (
                      <Button size="small" variant="secondary" onClick={cancelLoad}>
                        Avbryt
                      </Button>
                    )}
                  </>
                )}
                <Box style={{ marginInlineStart: 'auto' }}>
                  <Switch
                    checked={editMode === 'endre'}
                    onChange={(e) => setEditMode(e.target.checked ? 'endre' : 'les')}
                  >
                    Endremodus
                  </Switch>
                </Box>
              </HStack>
            </VStack>
          </ExpansionCard.Content>
        </ExpansionCard>

        {pageMode === 'mapping' && (
          <>
            {categoriesLoading && (
              <HStack gap="space-8" align="center" role="status">
                <Loader size="small" title="Henter data" />
                <BodyShort>Henter ISO-kategorier...</BodyShort>
              </HStack>
            )}

            {!categoriesLoading && (
              <>
                {!isoMappingsError && isoMappings && (
                  <ExpansionCard size="small" aria-label="Verifiseringsstatus">
                    <ExpansionCard.Header>
                      <HStack gap="space-12" align="center">
                        <ExpansionCard.Title size="small">Verifiseringsstatus</ExpansionCard.Title>
                        {verificationProgress.total === 0 ? (
                          <BodyShort size="small">Ingen mappinger</BodyShort>
                        ) : (
                          <BodyShort size="small" role="status" aria-live="polite">
                            {verificationProgress.verified.toLocaleString('nb-NO')} av{' '}
                            {verificationProgress.total.toLocaleString('nb-NO')} verifisert (
                            {verificationProgress.percentage} %)
                          </BodyShort>
                        )}
                      </HStack>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                      <VStack gap="space-8">
                        {verificationProgress.total > 0 && (
                          <>
                            <ProgressBar
                              size="small"
                              value={verificationProgress.percentage}
                              aria-label="Verifiserte ISO-mappinger"
                            />
                            <BodyShort size="small" textColor="subtle">
                              Gjelder alle mappinger, uavhengig av filter. Verifisering kobler ikke produkter til v22.
                            </BodyShort>
                            <ExpansionCard size="small" aria-label="Verifisering per v16 nivå 1">
                              <ExpansionCard.Header>
                                <ExpansionCard.Title size="small">Verifisering per v16 nivå 1</ExpansionCard.Title>
                              </ExpansionCard.Header>
                              <ExpansionCard.Content>
                                <VStack gap="space-12">
                                  {verificationProgress.groups.map((group) => (
                                    <VStack key={group.prefix} gap="space-4">
                                      <BodyShort size="small">
                                        {group.prefix ? `ISO ${group.prefix}` : 'Uten v16-kode'}:{' '}
                                        {group.verified.toLocaleString('nb-NO')} av{' '}
                                        {group.total.toLocaleString('nb-NO')} verifisert ({group.percentage} %)
                                      </BodyShort>
                                      <ProgressBar
                                        size="small"
                                        value={group.percentage}
                                        aria-label={
                                          group.prefix
                                            ? `Verifiserte mappinger for ISO ${group.prefix}`
                                            : 'Verifiserte mappinger uten v16-kode'
                                        }
                                      />
                                    </VStack>
                                  ))}
                                </VStack>
                              </ExpansionCard.Content>
                            </ExpansionCard>
                          </>
                        )}
                      </VStack>
                    </ExpansionCard.Content>
                  </ExpansionCard>
                )}
                <HStack gap="space-16">
                  <Checkbox
                    size="small"
                    checked={onlyUnverified}
                    onChange={(event) => {
                      setOnlyUnverified(event.target.checked)
                      setMappingPage(1)
                    }}
                  >
                    Vis bare ikke verifiserte
                  </Checkbox>
                  <Checkbox
                    size="small"
                    checked={unverifiedFirst}
                    onChange={(event) => {
                      setUnverifiedFirst(event.target.checked)
                      setMappingPage(1)
                    }}
                  >
                    Ikke verifiserte først
                  </Checkbox>
                </HStack>
                {showCounts && largeLoadWarning}
                {showCounts && loadError && <Alert variant="error">{loadError}</Alert>}
                {showCounts && pageLoading && (
                  <HStack gap="space-8" align="center" role="status">
                    <Loader size="small" title="Henter produkter" />
                    <BodyShort>
                      {loadProgress && loadProgress.total > 0
                        ? `Henter ${loadProgress.loaded} av ${loadProgress.total} produkter for antall...`
                        : 'Henter produkter for antall...'}
                    </BodyShort>
                  </HStack>
                )}
                <HStack justify="space-between" align="end" style={{ flexWrap: 'wrap' }} gap="space-16">
                  <BodyShort role="status" aria-live="polite">
                    {filteredMappingRows.length} mapping-rader{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}
                  </BodyShort>
                </HStack>

                <Box style={{ overflowX: 'auto' }}>
                  {pagedMappingRows.length === 0 ? (
                    <Alert variant="info">Ingen treff for valgt ISO-filter.</Alert>
                  ) : (
                    <Table size="small">
                      <caption className="aksel-sr-only">
                        v16 til v22 ISO-mapping{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert
                        kolonnevis. Side {mappingPage} av {mappingTotalPages}.
                      </caption>
                      <Table.Header>
                        <Table.Row>
                          <IsoLevelHeaders
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={toggleSort}
                            visibleLevels={visibleIsoLevelsV1}
                          />
                          <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                          <Iso22LevelHeaders visibleLevels={visibleIsoLevelsV22} />
                          <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                          <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                          {showCounts && (
                            <Table.HeaderCell scope="col" style={{ width: '1%', whiteSpace: 'nowrap' }}>
                              <HStack gap="space-4" align="center" wrap={false}>
                                Antall
                                <HelpText title="Hva betyr Antall?" placement="top">
                                  Antall produkter / varianter registrert med denne v16-koden. «–» betyr at produktene
                                  ikke er lastet ennå.
                                </HelpText>
                              </HStack>
                            </Table.HeaderCell>
                          )}
                          <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                          {editMode === 'endre' && <AksjonHeader />}
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {pagedMappingRows.map((row) => (
                          <Table.Row key={row.key}>
                            <IsoLevelCells row={row} visibleLevels={visibleIsoLevelsV1} />
                            <OptionalTitleCellsV1 visible={visibleOptionalsV1} row={row} />
                            <Iso22LevelCells row={row} visibleLevels={visibleIsoLevelsV22} />
                            <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                            <Table.DataCell>
                              <MappingTypes types={row.mappingTypes} mappingAvailable={row.mappingAvailable} />
                              {splitCodes.has(row.isoCode.replace(/\s/g, '')) && (
                                <Tag variant="warning" size="small">
                                  Splitt: krever manuell kontroll
                                </Tag>
                              )}
                            </Table.DataCell>
                            {showCounts && (
                              <Table.DataCell style={{ whiteSpace: 'nowrap' }}>
                                {row.isoCode && isIsoCodeLoaded(row.isoCode) ? (
                                  `${countsByIsoCode.get(row.isoCode)?.products ?? 0} / ${countsByIsoCode.get(row.isoCode)?.variants ?? 0}`
                                ) : (
                                  <span title="Ikke lastet. Bruk Hent liste eller Last inn produkter i Vis oversikt.">
                                    –
                                  </span>
                                )}
                              </Table.DataCell>
                            )}
                            <Table.DataCell>
                              <MappingVerification verified={row.mappingVerified} />
                            </Table.DataCell>
                            {editMode === 'endre' && (
                              <AksjonCell
                                menuLabel={`ISO ${row.isoCode || row.iso22Lvl4 || row.iso22Lvl3}`}
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                isoCode={row.isoCode || undefined}
                                {...getAksjonTargetProps(row.isoCode, row.mappingIds)}
                                busy={row.mappingIds.some((id) => verifyingMappingIds.has(id))}
                                onRequestVerify={handleRequestVerify}
                                onMoveIsoCode={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                              />
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  )}
                </Box>

                <HStack gap="space-16" align="end">
                  <Select
                    label="Rader per side"
                    size="small"
                    value={mappingPageSize}
                    onChange={(e) => {
                      setMappingPageSize(Number(e.target.value))
                      setMappingPage(1)
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </Select>
                  <Pagination page={mappingPage} count={mappingTotalPages} onPageChange={setMappingPage} size="small" />
                </HStack>
              </>
            )}
          </>
        )}

        {pageMode === 'extract' && (
          <>
            {/* Fetch trigger + summary */}
            {largeLoadWarning}
            {loadError && <Alert variant="error">{loadError}</Alert>}

            {pageLoading && (
              <HStack gap="space-8" align="center" role="status">
                <Loader size="small" title="Henter data" />
                <BodyShort>
                  {loadProgress && loadProgress.total > 0
                    ? `Henter ${loadProgress.loaded} av ${loadProgress.total} produkter...`
                    : 'Henter data...'}
                </BodyShort>
              </HStack>
            )}

            {rows !== null && !pageLoading && (
              <>
                {/* Summary */}
                <HStack justify="space-between" align="end" style={{ flexWrap: 'wrap' }} gap="space-16">
                  <HStack gap="space-12" align="center">
                    <BodyShort role="status" aria-live="polite">
                      {viewMode === 'product'
                        ? `${productRows.length} produkter (${filteredRows.length} varianter)`
                        : `${filteredRows.length} varianter (${productRows.length} produkter)`}
                      {selectedIsoCode
                        ? ` for ISO ${selectedIsoCode}`
                        : totalSeriesCount !== undefined
                          ? ` (${totalSeriesCount} aktive produktserier i systemet)`
                          : ''}
                    </BodyShort>
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={() => {
                        setRows(null)
                        setRowsScope(null)
                        setPendingLargeLoad(false)
                      }}
                    >
                      Tilbakestill
                    </Button>
                  </HStack>
                </HStack>

                {/* Table */}
                <Box style={{ overflowX: 'auto' }}>
                  {pagedRows.length === 0 ? (
                    <Alert variant="info">Ingen treff for valgt ISO-filter.</Alert>
                  ) : viewMode === 'product' ? (
                    <Table size="small">
                      <caption className="aksel-sr-only">
                        Produktserier{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert kolonnevis. Side{' '}
                        {variantPage} av {totalPages}.
                      </caption>
                      <Table.Header>
                        <Table.Row>
                          <IsoLevelHeaders
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={toggleSort}
                            visibleLevels={visibleIsoLevelsV1}
                          />
                          <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                          <Iso22LevelHeaders visibleLevels={visibleIsoLevelsV22} />
                          <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                          {showMappingTypes && (
                            <>
                              <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                              <Table.HeaderCell scope="col">Verifisering</Table.HeaderCell>
                            </>
                          )}
                          {visibleExtraColumns.has('produkt') && (
                            <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                          )}
                          <SortHeader
                            label="Ant. varianter"
                            active={sortKey === 'variantCount'}
                            dir={sortDir}
                            onClick={() => toggleSort('variantCount')}
                          />
                          {visibleExtraColumns.has('avtale') && (
                            <>
                              <Table.HeaderCell scope="col">Avtale</Table.HeaderCell>
                              <SortHeader
                                label="Rangering"
                                active={sortKey === 'agreementRank'}
                                dir={sortDir}
                                onClick={() => toggleSort('agreementRank')}
                              />
                              <SortHeader
                                label="Delkontraktnr."
                                active={sortKey === 'agreementPostNr'}
                                dir={sortDir}
                                onClick={() => toggleSort('agreementPostNr')}
                              />
                            </>
                          )}
                          {editMode === 'endre' && <AksjonHeader />}
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {(pagedRows as ProductSummaryRow[]).map((row) => (
                          <Table.Row key={row.seriesId}>
                            <IsoLevelCells row={row} visibleLevels={visibleIsoLevelsV1} />
                            <OptionalTitleCellsV1 visible={visibleOptionalsV1} row={row} />
                            <Iso22LevelCells row={row} visibleLevels={visibleIsoLevelsV22} />
                            <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                            {showMappingTypes && (
                              <>
                                <Table.DataCell>
                                  <MappingTypes types={row.mappingTypes} mappingAvailable={row.mappingAvailable} />
                                </Table.DataCell>
                                <Table.DataCell>
                                  <MappingVerification verified={row.mappingVerified} />
                                </Table.DataCell>
                              </>
                            )}
                            {visibleExtraColumns.has('produkt') && <Table.DataCell>{row.productTitle}</Table.DataCell>}
                            <Table.DataCell>{row.variantCount}</Table.DataCell>
                            {visibleExtraColumns.has('avtale') && (
                              <>
                                <Table.DataCell>{row.agreementRef}</Table.DataCell>
                                <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                                <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                              </>
                            )}
                            {editMode === 'endre' && (
                              <AksjonCell
                                menuLabel={`${row.productTitle} (ISO ${row.isoCode})`}
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                seriesId={row.seriesId}
                                isoCode={row.isoCode || undefined}
                                {...getAksjonTargetProps(row.isoCode, row.mappingIds)}
                                busy={row.mappingIds.some((id) => verifyingMappingIds.has(id))}
                                onRequestVerify={handleRequestVerify}
                                onMoveIsoCode={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                              />
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  ) : (
                    <Table size="small">
                      <caption className="aksel-sr-only">
                        Produktvarianter{selectedIsoCode ? ` for ISO ${selectedIsoCode}` : ''}, sortert kolonnevis. Side{' '}
                        {variantPage} av {totalPages}.
                      </caption>
                      <Table.Header>
                        <Table.Row>
                          <IsoLevelHeaders
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onSort={toggleSort}
                            visibleLevels={visibleIsoLevelsV1}
                          />
                          <OptionalTitleHeadersV1 visible={visibleOptionalsV1} />
                          <Iso22LevelHeaders visibleLevels={visibleIsoLevelsV22} />
                          <OptionalTitleHeadersV22 visible={visibleOptionalsV22} />
                          {showMappingTypes && (
                            <>
                              <Table.HeaderCell scope="col">Endringstype</Table.HeaderCell>
                              <Table.HeaderCell scope="col">Verifisering</Table.HeaderCell>
                            </>
                          )}
                          {visibleExtraColumns.has('produkt') && (
                            <Table.HeaderCell scope="col">Produktnavn</Table.HeaderCell>
                          )}
                          {visibleExtraColumns.has('variant') && (
                            <Table.HeaderCell scope="col">Variantnavn</Table.HeaderCell>
                          )}
                          <Table.HeaderCell scope="col">HMS-nr.</Table.HeaderCell>
                          <Table.HeaderCell scope="col">Leverandørref.</Table.HeaderCell>
                          {visibleExtraColumns.has('avtale') && (
                            <>
                              <Table.HeaderCell scope="col">Avtale</Table.HeaderCell>
                              <SortHeader
                                label="Rangering"
                                active={sortKey === 'agreementRank'}
                                dir={sortDir}
                                onClick={() => toggleSort('agreementRank')}
                              />
                              <SortHeader
                                label="Delkontraktnr."
                                active={sortKey === 'agreementPostNr'}
                                dir={sortDir}
                                onClick={() => toggleSort('agreementPostNr')}
                              />
                            </>
                          )}
                          {editMode === 'endre' && <AksjonHeader />}
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {(pagedRows as ExtractedProductVariant[]).map((row) => (
                          <Table.Row key={row.productId}>
                            <IsoLevelCells row={row} visibleLevels={visibleIsoLevelsV1} />
                            <OptionalTitleCellsV1 visible={visibleOptionalsV1} row={row} />
                            <Iso22LevelCells row={row} visibleLevels={visibleIsoLevelsV22} />
                            <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                            {showMappingTypes && (
                              <>
                                <Table.DataCell>
                                  <MappingTypes types={row.mappingTypes} mappingAvailable={row.mappingAvailable} />
                                </Table.DataCell>
                                <Table.DataCell>
                                  <MappingVerification verified={row.mappingVerified} />
                                </Table.DataCell>
                              </>
                            )}
                            {visibleExtraColumns.has('produkt') && <Table.DataCell>{row.productTitle}</Table.DataCell>}
                            {visibleExtraColumns.has('variant') && <Table.DataCell>{row.variantName}</Table.DataCell>}
                            <Table.DataCell>{row.hmsArtNr}</Table.DataCell>
                            <Table.DataCell>{row.supplierRef}</Table.DataCell>
                            {visibleExtraColumns.has('avtale') && (
                              <>
                                <Table.DataCell>{row.agreementRef}</Table.DataCell>
                                <Table.DataCell>{row.agreementRank ?? ''}</Table.DataCell>
                                <Table.DataCell>{row.agreementPostNr ?? ''}</Table.DataCell>
                              </>
                            )}
                            {editMode === 'endre' && (
                              <AksjonCell
                                menuLabel={`${row.variantName || row.productTitle} (HMS-nr. ${row.hmsArtNr || '-'})`}
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                seriesId={row.seriesId}
                                isoCode={row.isoCode || undefined}
                                {...getAksjonTargetProps(row.isoCode, row.mappingIds)}
                                busy={row.mappingIds.some((id) => verifyingMappingIds.has(id))}
                                onRequestVerify={handleRequestVerify}
                                onMoveIsoCode={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                              />
                            )}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  )}
                </Box>

                {/* Pagination */}
                <HStack gap="space-16" align="end">
                  <Select
                    label="Rader per side"
                    size="small"
                    value={variantPageSize}
                    onChange={(e) => {
                      setVariantPageSize(Number(e.target.value))
                      setVariantPage(1)
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </Select>
                  <Pagination page={variantPage} count={totalPages} onPageChange={setVariantPage} size="small" />
                </HStack>
              </>
            )}
          </>
        )}
      </VStack>
    </main>
  )
}

export default IsoOversikt
