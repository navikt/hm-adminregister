import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { createIso22Category, updateIsoMapping } from 'api/IsoCategoryApi'
import { getSeriesBySeriesId, updateProductIso22Category } from 'api/SeriesApi'
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
  ExpansionCard,
  HStack,
  Heading,
  InfoCard,
  Loader,
  Modal,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Table,
  TextField,
  VStack,
} from '@navikt/ds-react'

import AttachIso22CategoryModal from './AttachIso22CategoryModal'
import CreateIso22CategoryModal, { CreateIso22CategoryContext } from './CreateIso22CategoryModal'
import iso9999Icon from './ISO9999-01.svg'
import IsoBulkMoveModal from './IsoBulkMoveModal'
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
import { buildMappingRows, buildMappingsByCode16, mapToExtractedRows } from './isoMappingUtils'
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
import { buildIsoPath } from './isoPathUtils'
import { groupByProduct } from './isoRowUtils'
import { compareIsoCodes, sortByIsoLevel, sortProductRows, sortRows } from './isoSortUtils'

type EditMode = 'les' | 'endre'

const extractErrorMessage = (error: unknown): string => {
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

const IsoOversikt = () => {
  const { loggedInUser } = useAuthStore()
  const { isoCategories, isoLoading, isoError } = useIsoCategories()
  const { isoCategories22, isoLoading22, isoError22, mutateIsoCategories22 } = useIsoCategories22()
  const { isoMappings, isoMappingsLoading, isoMappingsError, mutateIsoMappings } = useIsoMappings(
    loggedInUser?.isAdmin === true
  )

  const [rows, setRows] = useState<ExtractedProductVariant[] | null>(null)
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
  const [moveModal, setMoveModal] = useState<{ open: boolean; seriesId: string | null }>({
    open: false,
    seriesId: null,
  })
  const [moveError, setMoveError] = useState<string | null>(null)
  const [bulkMoveModal, setBulkMoveModal] = useState<{ open: boolean; isoCode: string | null }>({
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
  const isoMappingsById = useMemo(() => new Map((isoMappings || []).map((m) => [m.id, m])), [isoMappings])

  // Ekte tilknytningsstatus per v16 isoCode - true kun når ALLE produkter/varianter med denne
  // v16-koden faktisk er koblet til den anbefalte v22-kategorien (rows[].iso22Attached er ekte
  // tilknytning, ikke visningsfallback). Mangler produkter for koden helt, regnes den som komplett
  // (ingenting å koble til). Brukes til å sperre "Verifiser" til reell tilknytning er gjort - se
  // AksjonCell og IsoBulkMoveModal.
  const attachmentCompleteByIsoCode = useMemo(() => {
    const map = new Map<string, boolean>()
    ;(rows || []).forEach((row) => {
      const prev = map.get(row.isoCode)
      map.set(row.isoCode, prev === undefined ? row.iso22Attached : prev && row.iso22Attached)
    })
    return map
  }, [rows])

  const handleToggleVerification = useCallback(
    async (mappingIds: string[], verified: boolean) => {
      const targets = mappingIds
        .map((id) => isoMappingsById.get(id))
        .filter((mapping): mapping is IsoMapDTO => !!mapping)
      if (!targets.length) return
      setVerificationError(null)
      setVerifyingMappingIds((prev) => new Set([...prev, ...mappingIds]))
      try {
        const updated = await Promise.all(targets.map((mapping) => updateIsoMapping({ ...mapping, verified })))
        const updatedById = new Map(updated.map((mapping) => [mapping.id, mapping]))
        mutateIsoMappings((current) => (current || []).map((mapping) => updatedById.get(mapping.id) ?? mapping), {
          revalidate: false,
        })
        setRows(
          (prev) =>
            prev?.map((row) =>
              row.mappingIds.some((id) => mappingIds.includes(id)) ? { ...row, mappingVerified: verified } : row
            ) ?? null
        )
      } catch (error) {
        setVerificationError(extractErrorMessage(error))
      } finally {
        setVerifyingMappingIds((prev) => {
          const next = new Set(prev)
          mappingIds.forEach((id) => next.delete(id))
          return next
        })
      }
    },
    [isoMappingsById, mutateIsoMappings]
  )

  const handleOpenMoveModal = useCallback((seriesId: string) => {
    setMoveError(null)
    setMoveModal({ open: true, seriesId })
  }, [])

  const handleConfirmMove = useCallback(
    async (isoCategory22: string) => {
      const seriesId = moveModal.seriesId
      if (!seriesId) return
      setMoveModal({ open: false, seriesId: null })
      try {
        await updateProductIso22Category(seriesId, isoCategory22)
        const updatedSeries = await getSeriesBySeriesId(seriesId)
        const newRows = mapToExtractedRows(
          [updatedSeries],
          sortedIsoCategories,
          sortedIsoCategories22,
          mappingsByCode16,
          mappingDataAvailable
        )
        setRows((prev) => {
          const withoutSeries = (prev || []).filter((row) => row.seriesId !== seriesId)
          return [...withoutSeries, ...newRows]
        })
      } catch (error) {
        setMoveError(extractErrorMessage(error))
      }
    },
    [moveModal.seriesId, sortedIsoCategories, sortedIsoCategories22, mappingsByCode16, mappingDataAvailable]
  )

  const movePreviewRows = useMemo(
    () => (moveModal.seriesId ? (rows || []).filter((row) => row.seriesId === moveModal.seriesId) : []),
    [rows, moveModal.seriesId]
  )

  const moveModalMappingIds = useMemo(
    () => Array.from(new Set(movePreviewRows.flatMap((row) => row.mappingIds))),
    [movePreviewRows]
  )
  const moveModalLocked = movePreviewRows.some((row) => row.mappingVerified === true)
  const moveModalUnlocking = moveModalMappingIds.some((id) => verifyingMappingIds.has(id))

  const handleOpenBulkMove = useCallback((isoCode: string) => {
    setBulkMoveModal({ open: true, isoCode })
  }, [])

  const handleOpenCreateCategoryModal = useCallback((context: CreateIso22CategoryContext) => {
    setCreateCategoryContext(context)
  }, [])

  // Sperrer verifisering (ikke fjerning av verifisering) dersom ikke alle produkter/varianter under
  // konteksten (enkeltprodukt eller hele v16-koden) faktisk er koblet til riktig v22-kategori enda.
  const isAttachmentComplete = useCallback(
    (context: { seriesId?: string; isoCode?: string }): boolean => {
      if (context.seriesId) {
        const seriesRows = (rows || []).filter((row) => row.seriesId === context.seriesId)
        return seriesRows.length === 0 || seriesRows.every((row) => row.iso22Attached)
      }
      if (context.isoCode) {
        return attachmentCompleteByIsoCode.get(context.isoCode) ?? true
      }
      return true
    },
    [rows, attachmentCompleteByIsoCode]
  )

  const handleRequestVerify = useCallback(
    (mappingIds: string[], verified: boolean, context: { seriesId?: string; isoCode?: string }) => {
      if (verified && !isAttachmentComplete(context)) return
      setVerifyConfirm({ mappingIds, verified, seriesId: context.seriesId, isoCode: context.isoCode })
    },
    [isAttachmentComplete]
  )

  const handleShowOverviewFromVerifyConfirm = useCallback(() => {
    if (!verifyConfirm) return
    const { seriesId, isoCode } = verifyConfirm
    setVerifyConfirm(null)
    if (seriesId) {
      handleOpenMoveModal(seriesId)
    } else if (isoCode) {
      handleOpenBulkMove(isoCode)
    }
  }, [verifyConfirm, handleOpenMoveModal, handleOpenBulkMove])

  const handleConfirmVerify = useCallback(() => {
    if (!verifyConfirm) return
    const { mappingIds, verified } = verifyConfirm
    setVerifyConfirm(null)
    handleToggleVerification(mappingIds, verified)
  }, [verifyConfirm, handleToggleVerification])

  const handleCreateIso22Category = useCallback(
    async ({
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
      await createIso22Category({
        id: crypto.randomUUID(),
        isoCode,
        isoTitle,
        isoText,
        level: 4,
        isoTranslations: { titleEn: null, textEn: null },
        searchWords,
        // Nyopprettede nivå 4-kategorier finnes ikke i offisiell ISO 9999-standard og skal derfor
        // ha type NAT (norsk tilleggskode), ikke ISO - se Iso16ToIso22UtilController i backend.
        isoType: 'NAT',
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
        isoLevel: 4,
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
      const targets = mappingIds
        .map((id) => isoMappingsById.get(id))
        .filter((mapping): mapping is IsoMapDTO => !!mapping)
      if (targets.length) {
        const updated = await Promise.all(
          targets.map((mapping) => updateIsoMapping({ ...mapping, code22: isoCode, level22: 4 }))
        )
        const updatedById = new Map(updated.map((mapping) => [mapping.id, mapping]))
        mutateIsoMappings((current) => (current || []).map((mapping) => updatedById.get(mapping.id) ?? mapping), {
          revalidate: false,
        })
      }
    },
    [loggedInUser?.userName, mutateIsoCategories22, isoMappingsById, mutateIsoMappings]
  )

  const handleBulkMoveCompleted = useCallback(
    async (movedSeriesIds: string[]) => {
      setBulkMoveModal({ open: false, isoCode: null })
      if (rows === null || !movedSeriesIds.length) return
      try {
        const abortController = new AbortController()
        const updatedSeries = await fetchSeriesDetailsConcurrent(movedSeriesIds, () => {}, abortController.signal)
        const newRows = mapToExtractedRows(
          updatedSeries,
          sortedIsoCategories,
          sortedIsoCategories22,
          mappingsByCode16,
          mappingDataAvailable
        )
        setRows((prev) => {
          const withoutMoved = (prev || []).filter((row) => !movedSeriesIds.includes(row.seriesId))
          return [...withoutMoved, ...newRows]
        })
      } catch {
        // Rows kunne ikke oppdateres automatisk. Bruk "Hent liste" for å laste inn siste data.
      }
    },
    [rows, sortedIsoCategories, sortedIsoCategories22, mappingsByCode16, mappingDataAvailable]
  )

  const selectedIsoCode = selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1

  const mappingRows = useMemo(
    () => buildMappingRows(sortedIsoCategories, sortedIsoCategories22, isoMappings || [], mappingDataAvailable),
    [sortedIsoCategories, sortedIsoCategories22, isoMappings, mappingDataAvailable]
  )

  const bulkMoveContext = useMemo(
    () => (bulkMoveModal.isoCode ? (mappingRows.find((row) => row.isoCode === bulkMoveModal.isoCode) ?? null) : null),
    [mappingRows, bulkMoveModal.isoCode]
  )
  // Kilden til sannhet for hvilke produkter/varianter som faktisk har v16-koden - hentet fra samme
  // `rows`-tilstand som resten av oversikten (Produkt/Variant-visningen), IKKE et separat
  // backend-kall filtrert på isoCode. Tidligere gjorde IsoBulkMoveModal et eget kall til
  // /admreg/api/v1/series?isoCode=X, som i praksis kunne gi 0 treff selv når produkter fantes (viste
  // seg å ikke stemme overens med tabellens telling) - se bruker-rapportert avvik for 18090401.
  const bulkMoveSourceRows = useMemo(
    () => (bulkMoveModal.isoCode ? (rows || []).filter((row) => row.isoCode === bulkMoveModal.isoCode) : []),
    [rows, bulkMoveModal.isoCode]
  )

  const filteredMappingRows = useMemo(() => {
    const base = selectedIsoCode ? mappingRows.filter((row) => row.isoCode.startsWith(selectedIsoCode)) : mappingRows
    if (selectedIsoCode) return [...base].sort((a, b) => compareIsoCodes(a.isoCode, b.isoCode, 'asc'))
    return sortByIsoLevel(base, sortKey, sortDir)
  }, [mappingRows, selectedIsoCode, sortKey, sortDir])

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
        const firstChunk = await fetchSeriesPage(0, SERIES_PAGE_SIZE, selectedIsoCode, abortController.signal)
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
          const chunk = await fetchSeriesPage(p, SERIES_PAGE_SIZE, selectedIsoCode, abortController.signal)
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
      mappingDataAvailable,
    ]
  )

  // Forhåndshenter produkt-/variantdata i bakgrunnen mens admin fortsatt ser "Ren ISO-mapping" -
  // slik unngås en eksplisitt "Hent liste"-klikk når man bytter til Produkt- eller Variant-visning.
  // Kjøres kun én gang, og kun når datasettet er innenfor SERIES_WARN_THRESHOLD (loadAllRows setter
  // da pendingLargeLoad i stedet for å laste alt) - store, ufiltrerte uttrekk krever fortsatt et
  // eksplisitt admin-samtykke via "Fortsett likevel".
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

  const level1Options = useMemo(() => sortedIsoCategories.filter((it) => it.isoLevel === 1), [sortedIsoCategories])
  const level2Options = useMemo(
    () =>
      selectedLevel1
        ? sortedIsoCategories.filter((it) => it.isoLevel === 2 && it.isoCode.startsWith(selectedLevel1))
        : [],
    [selectedLevel1, sortedIsoCategories]
  )
  const level3Options = useMemo(
    () =>
      selectedLevel2
        ? sortedIsoCategories.filter((it) => it.isoLevel === 3 && it.isoCode.startsWith(selectedLevel2))
        : [],
    [selectedLevel2, sortedIsoCategories]
  )
  const level4Options = useMemo(
    () =>
      selectedLevel3
        ? sortedIsoCategories.filter((it) => it.isoLevel === 4 && it.isoCode.startsWith(selectedLevel3))
        : [],
    [selectedLevel3, sortedIsoCategories]
  )

  const filteredRows = useMemo(() => {
    if (!rows) return []
    const base = selectedIsoCode ? rows.filter((row) => row.isoCode.startsWith(selectedIsoCode)) : rows
    return sortRows(base, sortKey, sortDir)
  }, [rows, selectedIsoCode, sortKey, sortDir])

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
    const match = sortedIsoCategories.find((cat) => cat.isoCode.replace(/\s/g, '') === stripped)
    if (match) {
      setIsoInput(match.isoCode)
      const path = buildIsoPath(match.isoCode, sortedIsoCategories)
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
        <AttachIso22CategoryModal
          isOpen={moveModal.open}
          setIsOpen={(open) => setMoveModal((prev) => ({ ...prev, open }))}
          onClick={handleConfirmMove}
          targetIso22Code={movePreviewRows[0]?.iso22Lvl4 || undefined}
          targetIso22Title={movePreviewRows[0]?.iso22Lvl4Title || undefined}
          missingLevel4={!!movePreviewRows[0] && !movePreviewRows[0].iso22Lvl4 && !!movePreviewRows[0].iso22Lvl3}
          iso22Lvl3={movePreviewRows[0]?.iso22Lvl3 || undefined}
          iso22Lvl3Title={movePreviewRows[0]?.iso22Lvl3Title || undefined}
          mappingIds={moveModalMappingIds}
          onRequestCreateCategory={handleOpenCreateCategoryModal}
          heading={
            movePreviewRows[0]?.productTitle
              ? `Koble "${movePreviewRows[0].productTitle}" til ISO v22-kategori`
              : 'Koble til ISO v22-kategori'
          }
          confirmButtonText="Koble til"
          lockedMessage={
            moveModalLocked ? (
              <BodyShort size="small">
                Denne ISO-mappingen er verifisert og må fjernes fra verifisering før produktet kan kobles til en annen
                v22-kategori.
              </BodyShort>
            ) : undefined
          }
          onRequestUnlock={moveModalLocked ? () => handleToggleVerification(moveModalMappingIds, false) : undefined}
          unlocking={moveModalUnlocking}
          previewContent={
            movePreviewRows.length > 0 ? (
              <VStack gap="space-8">
                <BodyShort>
                  Produktet har for øyeblikket v16-kode <strong>{movePreviewRows[0].isoCode}</strong> og v22-kode{' '}
                  <strong>{movePreviewRows[0].iso22Lvl4 || movePreviewRows[0].iso22Lvl3 || 'Ingen kategori'}</strong>.
                  v16-koden beholdes uendret. {movePreviewRows.length} variant
                  {movePreviewRows.length === 1 ? '' : 'er'} vil bli koblet til den valgte v22-kategorien:
                </BodyShort>
                <Table size="small" zebraStripes>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell scope="col">Variant</Table.HeaderCell>
                      <Table.HeaderCell scope="col">HMS-nr.</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {movePreviewRows.map((row) => (
                      <Table.Row key={row.productId}>
                        <Table.DataCell>{row.variantName}</Table.DataCell>
                        <Table.DataCell>{row.hmsArtNr}</Table.DataCell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </VStack>
            ) : undefined
          }
        />
        <IsoBulkMoveModal
          isOpen={bulkMoveModal.open}
          sourceIsoCode={bulkMoveModal.isoCode}
          context={bulkMoveContext}
          preloadedRows={bulkMoveSourceRows}
          rowsLoaded={rows !== null}
          rowsLoading={pageLoading}
          onRequestLoadRows={() => loadAllRows(true)}
          onClose={() => setBulkMoveModal({ open: false, isoCode: null })}
          onCompleted={handleBulkMoveCompleted}
          onRequestVerify={handleRequestVerify}
          verifying={bulkMoveContext ? bulkMoveContext.mappingIds.some((id) => verifyingMappingIds.has(id)) : false}
          onRequestCreateCategory={handleOpenCreateCategoryModal}
        />
        <CreateIso22CategoryModal
          context={createCategoryContext}
          onClose={() => setCreateCategoryContext(null)}
          onCreate={handleCreateIso22Category}
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
                  ? 'Vil du markere denne ISO-mappingen som verifisert? Dette betyr at endringen/migreringen er ferdig kontrollert.'
                  : 'Vil du fjerne verifiseringen for denne ISO-mappingen? Den vil da vises som ikke verifisert igjen.'}
              </BodyShort>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setVerifyConfirm(null)}>
                Avbryt
              </Button>
              <Button variant="primary" onClick={handleConfirmVerify}>
                {verifyConfirm.verified ? 'Verifiser' : 'Fjern verifisering'}
              </Button>
              {/* "Vis oversikt" er overflødig når dialogen ble åpnet fra innsiden av oversiktsmodalen selv */}
              {!(
                (verifyConfirm.seriesId && moveModal.open && moveModal.seriesId === verifyConfirm.seriesId) ||
                (verifyConfirm.isoCode && bulkMoveModal.open && bulkMoveModal.isoCode === verifyConfirm.isoCode)
              ) &&
                (verifyConfirm.seriesId || verifyConfirm.isoCode) && (
                  <Button variant="tertiary" onClick={handleShowOverviewFromVerifyConfirm}>
                    Vis oversikt
                  </Button>
                )}
            </Modal.Footer>
          </Modal>
        )}
        {moveError && (
          <Alert variant="error" closeButton onClose={() => setMoveError(null)}>
            {moveError}
          </Alert>
        )}
        {verificationError && (
          <Alert variant="error" closeButton onClose={() => setVerificationError(null)}>
            {verificationError}
          </Alert>
        )}
        <InfoCard data-color="warning">
          <InfoCard.Header>
            <InfoCard.Title>Obs!</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            Dette er fase 1 av ISO Admin. Den viser produkter og varianter med både v16- og v22-kategorisering. Uttrekk
            til fil, revisjonshistorikk og redigering av ISO-kategorier kommer i senere faser.
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
                    label="ISO-kode (v16)"
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
                {selectedIsoCode && <BodyShort size="small">Valgt v16-kode: {selectedIsoCode}</BodyShort>}
              </HStack>

              <HStack gap="space-8" align="end" wrap>
                <Select
                  label="v16 nivå 1"
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
                  label="v16 nivå 2"
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
                  label="v16 nivå 3"
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
                  label="v16 nivå 4"
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
                    {editMode === 'endre' ? 'Endre' : 'Lese'}
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
                            </Table.DataCell>
                            <Table.DataCell>
                              <MappingVerification verified={row.mappingVerified} />
                            </Table.DataCell>
                            {editMode === 'endre' && (
                              <AksjonCell
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                isoCode={row.isoCode || undefined}
                                iso22Lvl3={row.iso22Lvl3 || undefined}
                                iso22Lvl3Title={row.iso22Lvl3Title || undefined}
                                iso22Lvl4={row.iso22Lvl4 || undefined}
                                attachmentComplete={
                                  row.isoCode ? (attachmentCompleteByIsoCode.get(row.isoCode) ?? true) : true
                                }
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
            {pendingLargeLoad && (
              <Alert variant="warning">
                Systemet inneholder <strong>{totalSeriesCount}</strong> aktive produktserier på tvers av alle
                ISO-kategorier. Uten ISO-filter vil alle hentes, noe som kan ta lang tid eller feile. Velg ISO-filter
                ovenfor for å begrense uttrekket, eller fortsett likevel.
                <HStack gap="space-8" style={{ marginTop: '0.75rem' }}>
                  <Button size="small" variant="secondary" onClick={() => loadAllRows(true)}>
                    Fortsett likevel
                  </Button>
                  <Button size="small" variant="tertiary" onClick={() => setPendingLargeLoad(false)}>
                    Avbryt
                  </Button>
                </HStack>
              </Alert>
            )}

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
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                seriesId={row.seriesId}
                                isoCode={row.isoCode || undefined}
                                iso22Lvl3={row.iso22Lvl3 || undefined}
                                iso22Lvl3Title={row.iso22Lvl3Title || undefined}
                                iso22Lvl4={row.iso22Lvl4 || undefined}
                                attachmentComplete={row.iso22Attached}
                                busy={row.mappingIds.some((id) => verifyingMappingIds.has(id))}
                                onRequestVerify={handleRequestVerify}
                                onMove={handleOpenMoveModal}
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
                                mappingIds={row.mappingIds}
                                mappingVerified={row.mappingVerified}
                                mappingAvailable={row.mappingAvailable}
                                seriesId={row.seriesId}
                                isoCode={row.isoCode || undefined}
                                iso22Lvl3={row.iso22Lvl3 || undefined}
                                iso22Lvl3Title={row.iso22Lvl3Title || undefined}
                                iso22Lvl4={row.iso22Lvl4 || undefined}
                                attachmentComplete={row.iso22Attached}
                                busy={row.mappingIds.some((id) => verifyingMappingIds.has(id))}
                                onRequestVerify={handleRequestVerify}
                                onMove={handleOpenMoveModal}
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
