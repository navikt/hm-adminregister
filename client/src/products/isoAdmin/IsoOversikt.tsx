import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { createIso22Category, updateIsoMapping } from 'api/IsoCategoryApi'
import { useAuthStore } from 'utils/store/useAuthStore'
import {
  useAdminIsoCategories22,
  useIsoCategories,
  useIsoCategories22,
  useIsoMappingVerifiedPercentage,
  useIsoMappings,
} from 'utils/swr-hooks'
import { Iso22, Iso22DTO, IsoCategory22DTO, IsoMapDTO } from 'utils/types/response-types'

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
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Table,
  TextField,
  VStack,
} from '@navikt/ds-react'

import CreateIso22CategoryModal, { CreateIso22CategoryContext } from './CreateIso22CategoryModal'
import EditIso22CategoryModal from './EditIso22CategoryModal'
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
import { extractErrorMessage } from './errorUtils'
import { ALL_MAPPING_TYPES, loadIsoAdminPreferences, saveIsoAdminPreferences } from './isoAdminPreferences'
import { buildMappingRows, buildMappingsByCode16, mapToExtractedRows, resolveIso22Targets } from './isoMappingUtils'
import {
  SERIES_PAGE_SIZE,
  SERIES_WARN_THRESHOLD,
  fetchSeriesDetailsConcurrent,
  fetchSeriesForIsoCode,
  fetchSeriesPage,
} from './isoOversiktApi'
import {
  ExtraColumn,
  ExtractedProductVariant,
  ISO_MAP_LABELS,
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
const mappingTypeLabels = Object.values(ISO_MAP_LABELS)

// Admin-endepunktet returnerer databaseraden uten nivå, så nivået utledes av kodelengden slik backend gjør.
const toIsoCategory22 = (category: Iso22): IsoCategory22DTO => {
  const isoCode = category.isoCode.replace(/\s/g, '')
  return {
    isoCode,
    isoTitle: category.isoTitle,
    isoText: category.isoText ?? '',
    isoTranslations: category.isoTranslations,
    isoLevel: [2, 4, 6, 8].indexOf(isoCode.length) + 1,
    created: category.created,
    updated: category.updated,
    searchWords: category.searchWords,
  }
}

const IsoOversikt = () => {
  const { loggedInUser } = useAuthStore()
  const { isoCategories, isoLoading, isoError } = useIsoCategories()
  const isAdmin = loggedInUser?.isAdmin === true
  const preferencesUserId = loggedInUser?.userId
  // Leses bare ved første render, slik at lagrede valg er på plass uten at standardverdiene blinker forbi.
  const [initialPreferences] = useState(() => loadIsoAdminPreferences(preferencesUserId))
  const {
    isoCategories22: publicIsoCategories22,
    isoLoading22: publicIsoLoading22,
    isoError22: publicIsoError22,
    mutateIsoCategories22,
  } = useIsoCategories22()
  const { adminIsoCategories22, adminIsoLoading22, adminIsoError22, mutateAdminIsoCategories22 } =
    useAdminIsoCategories22(isAdmin)
  const { isoMappings, isoMappingsLoading, isoMappingsError, mutateIsoMappings } = useIsoMappings(isAdmin)
  const { verifiedPercentage, verifiedPercentageError, mutateVerifiedPercentage } =
    useIsoMappingVerifiedPercentage(isAdmin)

  // Admin får v22-kategoriene fra databasen, slik at kategorier opprettet tidligere alltid finnes selv om
  // den åpne listen er utdatert. Den åpne listen brukes for andre brukere og hvis admin-kallet feiler.
  const preferAdminIso22List = isAdmin && !adminIsoError22
  const isoCategories22 = useMemo(
    () => (preferAdminIso22List ? adminIsoCategories22?.map(toIsoCategory22) : publicIsoCategories22),
    [preferAdminIso22List, adminIsoCategories22, publicIsoCategories22]
  )
  const isoLoading22 = preferAdminIso22List ? adminIsoLoading22 : publicIsoLoading22
  const isoError22 = preferAdminIso22List ? undefined : publicIsoError22

  const [rows, setRows] = useState<ExtractedProductVariant[] | null>(null)
  // ISO-prefikset `rows` ble lastet for ('' = alle). `rows` kan være lastet for et annet filter enn det
  // som vises nå, så tilknytningsstatus for koder utenfor prefikset er ukjent.
  const [rowsScope, setRowsScope] = useState<string | null>(null)
  const [totalSeriesCount, setTotalSeriesCount] = useState<number | undefined>(undefined)
  const [pageLoading, setPageLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState<{ loaded: number; total: number } | null>(null)
  const [pendingLargeLoad, setPendingLargeLoad] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const loadAbortControllerRef = useRef<AbortController | null>(null)
  const [scopedRows, setScopedRows] = useState<{ isoCode: string; rows: ExtractedProductVariant[] } | null>(null)
  const [scopedLoading, setScopedLoading] = useState(false)
  const [scopedLoadError, setScopedLoadError] = useState<string | null>(null)
  const scopedLoadAbortControllerRef = useRef<AbortController | null>(null)

  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  const [selectedLevel4, setSelectedLevel4] = useState('')

  const [sortKey, setSortKey] = useState<SortKey>(initialPreferences.sortKey)
  const [sortDir, setSortDir] = useState<SortDir>(initialPreferences.sortDir)

  const [variantPage, setVariantPage] = useState(1)
  const [variantPageSize, setVariantPageSize] = useState(initialPreferences.variantPageSize)

  const [mappingPage, setMappingPage] = useState(1)
  const [mappingPageSize, setMappingPageSize] = useState(initialPreferences.mappingPageSize)
  const [showVerifiedIsoCodes, setShowVerifiedIsoCodes] = useState(initialPreferences.showVerifiedIsoCodes)
  const [selectedMappingTypes, setSelectedMappingTypes] = useState<string[]>(() => {
    const known = initialPreferences.selectedMappingTypes.filter(
      (type) => type === ALL_MAPPING_TYPES || mappingTypeLabels.includes(type)
    )
    return known.length ? known : [ALL_MAPPING_TYPES]
  })
  const [mappingTypeMenuOpen, setMappingTypeMenuOpen] = useState(false)

  const [visibleOptionalsV1, setVisibleOptionalsV1] = useState<Set<OptionalColumnV1>>(
    () => new Set(initialPreferences.visibleOptionalsV1)
  )
  const [visibleOptionalsV22, setVisibleOptionalsV22] = useState<Set<OptionalColumnV22>>(
    () => new Set(initialPreferences.visibleOptionalsV22)
  )
  const [visibleIsoLevelsV1, setVisibleIsoLevelsV1] = useState<Set<OptionalIsoLevel>>(
    () => new Set(initialPreferences.visibleIsoLevelsV1)
  )
  const [visibleIsoLevelsV22, setVisibleIsoLevelsV22] = useState<Set<OptionalIsoLevel>>(
    () => new Set(initialPreferences.visibleIsoLevelsV22)
  )
  const [visibleExtraColumns, setVisibleExtraColumns] = useState<Set<ExtraColumn>>(
    () => new Set(initialPreferences.visibleExtraColumns)
  )
  const [showMappingTypes, setShowMappingTypes] = useState(initialPreferences.showMappingTypes)
  const [otherOptionsOpen, setOtherOptionsOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(initialPreferences.filtersOpen)

  useEffect(() => {
    saveIsoAdminPreferences(preferencesUserId, {
      showVerifiedIsoCodes,
      selectedMappingTypes,
      sortKey,
      sortDir,
      mappingPageSize,
      variantPageSize,
      visibleOptionalsV1: [...visibleOptionalsV1],
      visibleOptionalsV22: [...visibleOptionalsV22],
      visibleIsoLevelsV1: [...visibleIsoLevelsV1],
      visibleIsoLevelsV22: [...visibleIsoLevelsV22],
      visibleExtraColumns: [...visibleExtraColumns],
      showMappingTypes,
      filtersOpen,
    })
  }, [
    preferencesUserId,
    showVerifiedIsoCodes,
    selectedMappingTypes,
    sortKey,
    sortDir,
    mappingPageSize,
    variantPageSize,
    visibleOptionalsV1,
    visibleOptionalsV22,
    visibleIsoLevelsV1,
    visibleIsoLevelsV22,
    visibleExtraColumns,
    showMappingTypes,
    filtersOpen,
  ])

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
  const [editIso22Code, setEditIso22Code] = useState<string | null>(null)

  const resetPaging = () => {
    setVariantPage(1)
    setMappingPage(1)
  }

  const sortedIsoCategories = useMemo(
    () => (isoCategories || []).filter((it) => it.isActive).sort((a, b) => a.isoCode.localeCompare(b.isoCode)),
    [isoCategories]
  )

  // Backend cacher v22-kategoriene i minnet frem til restart, så en ny henting fra SWR (f.eks. ved
  // fokus) mister kategorier opprettet i denne økten. De holdes derfor her og flettes alltid inn.
  const [createdIso22Categories, setCreatedIso22Categories] = useState<IsoCategory22DTO[]>([])
  const sortedIsoCategories22 = useMemo(() => {
    const serverCategories = isoCategories22 || []
    const serverCodes = new Set(serverCategories.map((category) => category.isoCode.replace(/\s/g, '')))
    return [
      ...serverCategories,
      ...createdIso22Categories.filter((category) => !serverCodes.has(category.isoCode.replace(/\s/g, ''))),
    ].sort((a, b) => a.isoCode.localeCompare(b.isoCode))
  }, [isoCategories22, createdIso22Categories])

  const mappingDataAvailable = !isoMappingsError
  const mappingsByCode16 = useMemo(() => buildMappingsByCode16(isoMappings || []), [isoMappings])
  const existingIso22Codes = useMemo(
    () => new Set(sortedIsoCategories22.map((category) => category.isoCode.replace(/\s/g, ''))),
    [sortedIsoCategories22]
  )
  const isoMappingsById = useMemo(() => new Map((isoMappings || []).map((m) => [m.id, m])), [isoMappings])

  const isIsoCodeLoaded = useCallback(
    (isoCode: string) =>
      (rows !== null && rowsScope !== null && isoCode.startsWith(rowsScope)) ||
      (scopedRows !== null && isoCode.startsWith(scopedRows.isoCode)),
    [rows, rowsScope, scopedRows]
  )

  const getLoadedRowsForIsoCode = useCallback(
    (isoCode: string): ExtractedProductVariant[] | null => {
      if (rows !== null && rowsScope !== null && isoCode.startsWith(rowsScope)) {
        return rows.filter((row) => row.isoCode === isoCode)
      }
      if (scopedRows !== null && isoCode.startsWith(scopedRows.isoCode)) {
        return scopedRows.rows.filter((row) => row.isoCode === isoCode)
      }
      return null
    },
    [rows, rowsScope, scopedRows]
  )

  // v22-mål per v16-kode, hentet fra mappingene (se resolveIso22Targets).
  const getIso22Targets = useCallback(
    (isoCode: string, mappingIds: string[]) =>
      resolveIso22Targets(
        isoCode,
        mappingIds.map((id) => isoMappingsById.get(id)).filter((mapping): mapping is IsoMapDTO => !!mapping),
        sortedIsoCategories22
      ),
    [isoMappingsById, sortedIsoCategories22]
  )

  // Nivå 3/4 for Aksjon-menyen. Mangler et mål nivå 4, tilbys oppretting under det målets nivå 3.
  const getAksjonTargetProps = useCallback(
    (isoCode: string, mappingIds: string[]) => {
      const targets = getIso22Targets(isoCode, mappingIds)
      const target = targets.find((it) => !it.level4Code && it.level3Code) ?? targets[0]
      return {
        iso22Lvl3: target?.level3Code || undefined,
        iso22Lvl3Title: target?.level3Title || undefined,
        iso22Lvl4: target?.level4Code || undefined,
        iso22Lvl4Codes: [...new Set(targets.flatMap((it) => (it.level4Code ? [it.level4Code] : [])))],
      }
    },
    [getIso22Targets]
  )

  const handleToggleVerification = useCallback(
    async (mappingIds: string[], verified: boolean): Promise<boolean> => {
      const targets = mappingIds
        .map((id) => isoMappingsById.get(id))
        .filter((mapping): mapping is IsoMapDTO => !!mapping)
      if (!targets.length) return false
      setVerificationError(null)
      setVerifyingMappingIds((prev) => new Set([...prev, ...mappingIds]))
      try {
        const updated = await Promise.all(targets.map((mapping) => updateIsoMapping({ ...mapping, verified })))
        const updatedById = new Map(updated.map((mapping) => [mapping.id, mapping]))
        mutateIsoMappings((current) => (current || []).map((mapping) => updatedById.get(mapping.id) ?? mapping), {
          revalidate: false,
        })
        const markVerified = (row: ExtractedProductVariant) =>
          row.mappingIds.some((id) => mappingIds.includes(id)) ? { ...row, mappingVerified: verified } : row
        setRows((prev) => prev?.map(markVerified) ?? null)
        setScopedRows((prev) => (prev ? { ...prev, rows: prev.rows.map(markVerified) } : null))
        mutateVerifiedPercentage()
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
    [isoMappingsById, mutateIsoMappings, mutateVerifiedPercentage]
  )

  const handleOpenBulkMove = useCallback((isoCode: string, mappingId?: string) => {
    setBulkMoveModal({ open: true, isoCode, mappingId })
  }, [])

  const handleOpenCreateCategoryModal = useCallback((context: CreateIso22CategoryContext) => {
    setCreateCategoryContext(context)
  }, [])

  // Forelder på nivå 3 er mappingens v22-mål når det finnes, ellers v16-kodens egen nivå 3-del.
  const handleCopyV16ToV22 = useCallback(
    ({ isoCode, mappingIds, iso22Lvl3 }: { isoCode: string; mappingIds: string[]; iso22Lvl3?: string }) => {
      const source = sortedIsoCategories.find((category) => category.isoCode === isoCode)
      const parentIsoCode = iso22Lvl3 || isoCode.slice(0, 6)
      const linksMapping = mappingIds.some(
        (id) => isoMappingsById.get(id)?.code22?.replace(/\s/g, '') === parentIsoCode
      )
      setCreateCategoryContext({
        parentIsoCode,
        parentIsoTitle: sortedIsoCategories22.find((category) => category.isoCode === parentIsoCode)?.isoTitle,
        mappingIds,
        copyFrom: {
          isoCode,
          linksMapping,
          initialValues: {
            suffix: isoCode.slice(6, 8),
            isoTitle: source?.isoTitle ?? '',
            isoText: source?.isoText ?? '',
            searchWords: source?.searchWords ?? [],
          },
        },
      })
    },
    [sortedIsoCategories, sortedIsoCategories22, isoMappingsById]
  )

  const verifyConfirmProductCount = useMemo(() => {
    if (!verifyConfirm?.isoCode) return null
    const loadedRows = getLoadedRowsForIsoCode(verifyConfirm.isoCode)
    if (loadedRows === null) return null
    return new Set(loadedRows.map((row) => row.seriesId)).size
  }, [verifyConfirm, getLoadedRowsForIsoCode])

  const handleRequestVerify = useCallback(
    (mappingIds: string[], verified: boolean, context: { seriesId?: string; isoCode?: string }) => {
      setVerificationError(null)
      setVerifyConfirm({ mappingIds, verified, seriesId: context.seriesId, isoCode: context.isoCode })
    },
    []
  )

  const handleShowOverviewFromVerifyConfirm = useCallback(() => {
    if (!verifyConfirm) return
    const { isoCode, mappingIds } = verifyConfirm
    setVerifyConfirm(null)
    if (isoCode) handleOpenBulkMove(isoCode, mappingIds.length === 1 ? mappingIds[0] : undefined)
  }, [verifyConfirm, handleOpenBulkMove])

  const handleConfirmVerify = useCallback(async () => {
    if (!verifyConfirm) return
    const { mappingIds, verified } = verifyConfirm
    if (await handleToggleVerification(mappingIds, verified)) setVerifyConfirm(null)
  }, [verifyConfirm, handleToggleVerification])

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
      if (!alreadyCreated) {
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
        // backend og lastes kun inn på nytt ved appstart. Den nye kategorien holdes derfor i
        // createdIso22Categories, som flettes inn i sortedIsoCategories22 også etter revalidering.
        const newCategory22: IsoCategory22DTO = {
          isoCode,
          isoTitle,
          isoText,
          isoTranslations: { titleEn: null, textEn: null },
          isoLevel: 4,
          created: now,
          updated: now,
          searchWords,
        }
        setCreatedIso22Categories((prev) => [...prev.filter((category) => category.isoCode !== isoCode), newCategory22])
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
        targets.map((mapping) => updateIsoMapping({ ...mapping, code22: isoCode, level22: 4 }))
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
    [loggedInUser?.userName, isoMappingsById, mutateIsoMappings, pendingIso22Links]
  )

  // Oppdaterer listen lokalt uten ny henting, slik at endringen vises med en gang uavhengig av
  // backend-cachen. Kategorier opprettet i denne økten ligger i createdIso22Categories og oppdateres der.
  const handleIso22CategoryUpdated = useCallback(
    (updated: Iso22DTO) => {
      const applyUpdate = (category: IsoCategory22DTO): IsoCategory22DTO =>
        category.isoCode.replace(/\s/g, '') === updated.isoCode
          ? {
              ...category,
              isoTitle: updated.isoTitle,
              isoText: updated.isoText ?? '',
              searchWords: updated.searchWords,
              updated: updated.updated,
            }
          : category
      const applyAdminUpdate = (category: Iso22): Iso22 =>
        category.isoCode.replace(/\s/g, '') === updated.isoCode ? { ...category, ...updated } : category
      mutateIsoCategories22((current) => current?.map(applyUpdate), { revalidate: false })
      mutateAdminIsoCategories22((current) => current?.map(applyAdminUpdate), { revalidate: false })
      setCreatedIso22Categories((prev) => prev.map(applyUpdate))
    },
    [mutateIsoCategories22, mutateAdminIsoCategories22]
  )

  const createFormExistingIso22Codes = useMemo(
    () => new Set([...existingIso22Codes].filter((code) => !pendingIso22Links.has(code))),
    [existingIso22Codes, pendingIso22Links]
  )

  const selectedIsoCode = selectedLevel4 || selectedLevel3 || selectedLevel2 || selectedLevel1

  const mappingRows = useMemo(
    () => buildMappingRows(sortedIsoCategories, sortedIsoCategories22, isoMappings || [], mappingDataAvailable),
    [sortedIsoCategories, sortedIsoCategories22, isoMappings, mappingDataAvailable]
  )

  // Ved splitt finnes flere mappingrader for samme v16-kode. Oversikten gjelder da raden den ble åpnet
  // fra (mappingId).
  const bulkMoveCandidates = useMemo(
    () => (bulkMoveModal.isoCode ? mappingRows.filter((row) => row.isoCode === bulkMoveModal.isoCode) : []),
    [mappingRows, bulkMoveModal.isoCode]
  )
  const bulkMoveContext = useMemo(() => {
    const { mappingId } = bulkMoveModal
    if (mappingId) return bulkMoveCandidates.find((row) => row.mappingIds.includes(mappingId)) ?? null
    return bulkMoveCandidates.length === 1 ? bulkMoveCandidates[0] : null
  }, [bulkMoveCandidates, bulkMoveModal])
  const bulkMoveTargetCode = useMemo(() => {
    if (!bulkMoveModal.isoCode || !bulkMoveContext) return ''
    return getIso22Targets(bulkMoveModal.isoCode, bulkMoveContext.mappingIds)[0]?.level4Code ?? ''
  }, [bulkMoveModal.isoCode, bulkMoveContext, getIso22Targets])
  // Hentes fra oversiktens `rows` når de dekker koden, ellers fra modalens avgrensede innlasting
  // (`scopedRows`). Viser bare produkter med nøyaktig denne v16-koden.
  const bulkMoveSourceRows = useMemo(
    () => (bulkMoveModal.isoCode ? (getLoadedRowsForIsoCode(bulkMoveModal.isoCode) ?? []) : []),
    [getLoadedRowsForIsoCode, bulkMoveModal.isoCode]
  )

  const filteredMappingRows = useMemo(() => {
    const scopedRows = selectedIsoCode
      ? mappingRows.filter((row) => row.isoCode.startsWith(selectedIsoCode))
      : mappingRows
    const visibleRows = showVerifiedIsoCodes ? scopedRows : scopedRows.filter((row) => row.mappingVerified !== true)
    const typedRows = selectedMappingTypes.includes(ALL_MAPPING_TYPES)
      ? visibleRows
      : visibleRows.filter((row) =>
          row.mappingTypes.some((type) => selectedMappingTypes.includes(ISO_MAP_LABELS[type]))
        )
    if (selectedIsoCode) return [...typedRows].sort((a, b) => compareIsoCodes(a.isoCode, b.isoCode, 'asc'))
    return sortByIsoLevel(typedRows, sortKey, sortDir)
  }, [mappingRows, selectedIsoCode, selectedMappingTypes, showVerifiedIsoCodes, sortKey, sortDir])

  const mappingTotalPages = Math.max(1, Math.ceil(filteredMappingRows.length / mappingPageSize))
  const pagedMappingRows = useMemo(() => {
    const from = (mappingPage - 1) * mappingPageSize
    return filteredMappingRows.slice(from, from + mappingPageSize)
  }, [filteredMappingRows, mappingPage, mappingPageSize])

  useEffect(() => {
    if (mappingPage > mappingTotalPages) setMappingPage(mappingTotalPages)
  }, [mappingPage, mappingTotalPages])

  useEffect(
    () => () => {
      loadAbortControllerRef.current?.abort()
      scopedLoadAbortControllerRef.current?.abort()
    },
    []
  )

  const categoriesLoading = isoLoading || isoLoading22 || isoMappingsLoading

  const loadRowsForIsoCode = useCallback(
    async (isoCode: string) => {
      if (!loggedInUser?.isAdmin) return
      scopedLoadAbortControllerRef.current?.abort()
      const abortController = new AbortController()
      scopedLoadAbortControllerRef.current = abortController
      setScopedLoading(true)
      setScopedLoadError(null)
      try {
        const series = await fetchSeriesForIsoCode(isoCode, () => {}, abortController.signal)
        abortController.signal.throwIfAborted()
        const loadedRows = mapToExtractedRows(
          series,
          sortedIsoCategories,
          sortedIsoCategories22,
          mappingsByCode16,
          mappingDataAvailable
        ).filter((row) => row.isoCode.startsWith(isoCode))
        setScopedRows({ isoCode, rows: loadedRows })
      } catch (error: unknown) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setScopedLoadError(error instanceof Error ? error.message : 'Klarte ikke å hente produkter og varianter')
        }
      } finally {
        if (scopedLoadAbortControllerRef.current === abortController) {
          scopedLoadAbortControllerRef.current = null
          setScopedLoading(false)
        }
      }
    },
    [loggedInUser?.isAdmin, sortedIsoCategories, sortedIsoCategories22, mappingsByCode16, mappingDataAvailable]
  )

  // Produktene hentes automatisk når oversikten åpnes, med mindre de allerede er lastet inn.
  // Effekten skal bare kjøre ved åpning eller ny ISO-kode, så de siste funksjonene leses via ref.
  const autoLoadRef = useRef({ isIsoCodeLoaded, loadRowsForIsoCode })
  autoLoadRef.current = { isIsoCodeLoaded, loadRowsForIsoCode }
  useEffect(() => {
    const { open, isoCode } = bulkMoveModal
    if (!open || !isoCode) return
    const { isIsoCodeLoaded: isLoaded, loadRowsForIsoCode: load } = autoLoadRef.current
    if (!isLoaded(isoCode)) void load(isoCode)
  }, [bulkMoveModal.open, bulkMoveModal.isoCode])

  const closeBulkMoveModal = useCallback(() => {
    scopedLoadAbortControllerRef.current?.abort()
    scopedLoadAbortControllerRef.current = null
    setScopedLoading(false)
    setScopedLoadError(null)
    setBulkMoveModal({ open: false, isoCode: null })
  }, [])

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
        setRowsScope(selectedIsoCode || '')
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
    setSelectedMappingTypes([ALL_MAPPING_TYPES])
    setShowVerifiedIsoCodes(true)
    resetPaging()
  }

  const toggleMappingType = (option: string, isSelected: boolean) => {
    setSelectedMappingTypes((current) => {
      if (option === ALL_MAPPING_TYPES) return [ALL_MAPPING_TYPES]
      const next = new Set(current.filter((type) => type !== ALL_MAPPING_TYPES))
      if (isSelected) next.add(option)
      else next.delete(option)
      return next.size ? [...next] : [ALL_MAPPING_TYPES]
    })
    setMappingPage(1)
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
        <HStack gap="space-12" align="center" justify="space-between" wrap>
          <HStack gap="space-12" align="center">
            <img src={iso9999Icon} alt="" aria-hidden width={48} height={48} />
            <Heading level="1" size="large">
              ISO Admin
            </Heading>
          </HStack>
          {verifiedPercentage !== undefined && (
            <VStack gap="space-4" className={styles.verifiedProgress}>
              <BodyShort size="small" id="iso-verified-percentage-label">
                Verifiserte ISO-mappinger: {verifiedPercentage} %
              </BodyShort>
              <ProgressBar
                size="small"
                value={verifiedPercentage}
                valueMax={100}
                aria-labelledby="iso-verified-percentage-label"
              />
            </VStack>
          )}
          {verifiedPercentageError && (
            <BodyShort size="small" textColor="subtle">
              Klarte ikke å hente andel verifiserte mappinger.
            </BodyShort>
          )}
        </HStack>
        <IsoBulkMoveModal
          isOpen={bulkMoveModal.open}
          sourceIsoCode={bulkMoveModal.isoCode}
          context={bulkMoveContext}
          targetIso22Code={bulkMoveTargetCode}
          preloadedRows={bulkMoveSourceRows}
          rowsLoaded={!!bulkMoveModal.isoCode && isIsoCodeLoaded(bulkMoveModal.isoCode)}
          rowsLoading={scopedLoading}
          rowsLoadError={scopedLoadError}
          onRequestLoadRows={() => {
            if (bulkMoveModal.isoCode) void loadRowsForIsoCode(bulkMoveModal.isoCode)
          }}
          onClose={closeBulkMoveModal}
          onRequestVerify={handleRequestVerify}
          verifying={bulkMoveContext ? bulkMoveContext.mappingIds.some((id) => verifyingMappingIds.has(id)) : false}
          onRequestCreateCategory={handleOpenCreateCategoryModal}
          onRequestCopyV16ToV22={handleCopyV16ToV22}
        />
        <CreateIso22CategoryModal
          context={createCategoryContext}
          onClose={() => setCreateCategoryContext(null)}
          onCreate={handleCreateIso22Category}
          existingIsoCodes={createFormExistingIso22Codes}
        />
        <EditIso22CategoryModal
          isoCode={editIso22Code}
          onClose={() => setEditIso22Code(null)}
          onUpdated={handleIso22CategoryUpdated}
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
              {verifyConfirm.isoCode && !(bulkMoveModal.open && bulkMoveModal.isoCode === verifyConfirm.isoCode) && (
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
            Dette er fase 1 av ISO Admin. Den viser produkter og varianter med både v16- og v22-kategorisering. Uttrekk
            til fil, revisjonshistorikk og redigering av ISO-kategorier kommer i senere faser.
          </InfoCard.Content>
        </InfoCard>
        {isoError22 && <Alert variant="warning">Klarte ikke å hente v22-kategorier.</Alert>}
        {isoMappingsError && <Alert variant="warning">Klarte ikke å hente mapping-status mellom v16 og v22.</Alert>}

        <ExpansionCard open={filtersOpen} onToggle={setFiltersOpen} size="small" aria-label="Filtre og visningsvalg">
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

                {pageMode === 'mapping' && (
                  <ActionMenu open={mappingTypeMenuOpen} onOpenChange={setMappingTypeMenuOpen}>
                    <ActionMenu.Trigger>
                      <Button
                        variant="secondary"
                        data-color="neutral"
                        size="small"
                        className={styles.otherOptionsButton}
                        icon={mappingTypeMenuOpen ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                        iconPosition="right"
                      >
                        {selectedMappingTypes.includes(ALL_MAPPING_TYPES)
                          ? 'Endringstype: Alle'
                          : `Endringstype: ${selectedMappingTypes.length} valgt`}
                      </Button>
                    </ActionMenu.Trigger>
                    <ActionMenu.Content>
                      <ActionMenu.CheckboxItem
                        checked={selectedMappingTypes.includes(ALL_MAPPING_TYPES)}
                        onCheckedChange={(checked) => toggleMappingType(ALL_MAPPING_TYPES, checked)}
                      >
                        {ALL_MAPPING_TYPES}
                      </ActionMenu.CheckboxItem>
                      <ActionMenu.Divider />
                      <ActionMenu.Group label="Endringstyper">
                        {mappingTypeLabels.map((label) => (
                          <ActionMenu.CheckboxItem
                            key={label}
                            disabled={!showVerifiedIsoCodes && label === ISO_MAP_LABELS.SAME}
                            checked={selectedMappingTypes.includes(label)}
                            onCheckedChange={(checked) => toggleMappingType(label, checked)}
                          >
                            {label}
                          </ActionMenu.CheckboxItem>
                        ))}
                      </ActionMenu.Group>
                    </ActionMenu.Content>
                  </ActionMenu>
                )}

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
                  {pageMode === 'mapping' && (
                    <Switch
                      checked={showVerifiedIsoCodes}
                      onChange={(e) => {
                        setShowVerifiedIsoCodes(e.target.checked)
                        if (!e.target.checked) toggleMappingType(ISO_MAP_LABELS.SAME, false)
                        setMappingPage(1)
                      }}
                    >
                      Vis verifiserte ISO-koder
                    </Switch>
                  )}
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
                            <Iso22LevelCells
                              row={row}
                              visibleLevels={visibleIsoLevelsV22}
                              existingIso22Codes={existingIso22Codes}
                            />
                            <OptionalTitleCellsV22 visible={visibleOptionalsV22} row={row} />
                            <Table.DataCell>
                              <MappingTypes types={row.mappingTypes} mappingAvailable={row.mappingAvailable} />
                            </Table.DataCell>
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
                                onShowOverview={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                                onCopyV16ToV22={handleCopyV16ToV22}
                                onEditCategory={setEditIso22Code}
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
                            <Iso22LevelCells
                              row={row}
                              visibleLevels={visibleIsoLevelsV22}
                              existingIso22Codes={existingIso22Codes}
                            />
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
                                onShowOverview={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                                onCopyV16ToV22={handleCopyV16ToV22}
                                onEditCategory={setEditIso22Code}
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
                            <Iso22LevelCells
                              row={row}
                              visibleLevels={visibleIsoLevelsV22}
                              existingIso22Codes={existingIso22Codes}
                            />
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
                                onShowOverview={handleOpenBulkMove}
                                onCreateCategory={handleOpenCreateCategoryModal}
                                onCopyV16ToV22={handleCopyV16ToV22}
                                onEditCategory={setEditIso22Code}
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
