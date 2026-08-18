import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getTechLabels, updateTechLabelSection } from 'api/TechLabelApi'
import ErrorAlert from 'error/ErrorAlert'
import { SECTIONS } from 'techlabels/sections'
import { useUrlSyncedSearchParam } from 'utils/common-hooks'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyShort,
  Box,
  Button,
  HGrid,
  Heading,
  HStack,
  Link as AkselLink,
  Loader,
  Pagination,
  Search,
  Select,
  Table,
  VStack,
} from '@navikt/ds-react'

import styles from './TechLabels.module.scss'
import seksjonerStyles from './Seksjoner.module.scss'

const PAGE_SIZE = 15

const FILTER_DIVERSE = '__diverse__'

type LabelSectionRow = {
  label: string
  count: number
  section: string | null
  /** true when rows sharing this label currently have inconsistent section values */
  mixed: boolean
}

const groupByLabel = (labels: { label: string; section?: string | null }[]): LabelSectionRow[] => {
  const byLabel = new Map<string, { label: string; section?: string | null }[]>()
  labels.forEach((l) => {
    const existing = byLabel.get(l.label) || []
    existing.push(l)
    byLabel.set(l.label, existing)
  })

  return Array.from(byLabel.entries())
    .map(([label, rows]) => {
      const sections = new Set(rows.map((r) => r.section || ''))
      const mixed = sections.size > 1
      return {
        label,
        count: rows.length,
        section: mixed ? null : rows[0].section || null,
        mixed,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'nb'))
}

export const Seksjoner = () => {
  const [searchTerm, setSearchTerm] = useUrlSyncedSearchParam('q')
  const [sectionFilter, setSectionFilter] = useUrlSyncedSearchParam('seksjon')
  const [page, setPage] = useState(1)
  const [savingLabel, setSavingLabel] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pendingSections, setPendingSections] = useState<Record<string, string>>({})

  const { data: dataTechLabels, error: errorTechLabels, isLoading: loadingTechLabels, mutate } = getTechLabels(
    {},
    0,
    5000
  )

  const labelRows = useMemo(() => groupByLabel(dataTechLabels?.content || []), [dataTechLabels])

  const filteredRows = labelRows.filter((row) => {
    if (!row.label.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (!sectionFilter) {
      return true
    }
    if (sectionFilter === FILTER_DIVERSE) {
      return !row.mixed && !row.section
    }
    return !row.mixed && row.section === sectionFilter
  })

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sectionFilter])

  const paginatedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loadingTechLabels) {
    return (
      <HGrid gap="space-12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    )
  }

  if (!dataTechLabels || errorTechLabels) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    )
  }

  const handleSave = async (label: string) => {
    const newSection = pendingSections[label] ?? ''
    setSaveError(null)
    setSavingLabel(label)
    try {
      await updateTechLabelSection({ label, section: newSection || null })
      await mutate()
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || err?.message || `Kunne ikke oppdatere seksjon for ${label}`)
    } finally {
      setSavingLabel(null)
    }
  }

  return (
    <main className="show-menu">
      <div className="page__background-container" style={{ overflow: 'auto' }}>
        <AkselLink as={Link} to="/tekniskdata">
          <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
          Tilbake til teknisk-data
        </AkselLink>
        <Heading level="1" size="large" spacing>
          Seksjoner
        </Heading>
        <VStack gap="space-24" className={styles.techLabelsContainer}>
          <BodyShort>
            Endring av seksjon oppdaterer alle tekniske data som har samme navn, uavhengig av
            ISO-kode.
          </BodyShort>
          {saveError && <Alert variant="error">{saveError}</Alert>}
          <HStack gap="space-16" wrap align="end">
            <Box role="search" className="search-box">
              <Search
                label="Søk etter navn på teknisk-data"
                variant="simple"
                placeholder="Søk etter navn på teknisk-data"
                size="medium"
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </Box>
            <Select
              label="Filtrer på nåværende seksjon"
              size="medium"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <option value="">Alle</option>
              {SECTIONS.filter((s) => s.value).map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
              <option value={FILTER_DIVERSE}>Diverse</option>
            </Select>
          </HStack>

          <Table size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Navn</Table.HeaderCell>
                <Table.HeaderCell className={styles.shortColumn}>Antall </Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>Nåværende seksjon</Table.HeaderCell>
                <Table.HeaderCell className={styles.mediumColumn}>Ny seksjon</Table.HeaderCell>
                <Table.HeaderCell className={seksjonerStyles.saveColumn} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {paginatedRows.map((row) => {
                const pendingValue = pendingSections[row.label] ?? row.section ?? ''
                return (
                  <Table.Row key={row.label}>
                    <Table.DataCell>{row.label}</Table.DataCell>
                    <Table.DataCell className={styles.shortColumn}>{row.count}</Table.DataCell>
                    <Table.DataCell className={styles.mediumColumn}>
                      {row.mixed ? 'Blandet' : row.section || 'Diverse'}
                    </Table.DataCell>
                    <Table.DataCell className={styles.mediumColumn}>
                      <Select
                        label=""
                        hideLabel
                        size="small"
                        value={pendingValue}
                        onChange={(e) =>
                          setPendingSections((prev) => ({ ...prev, [row.label]: e.target.value }))
                        }
                      >
                        {SECTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                    </Table.DataCell>
                    <Table.DataCell className={seksjonerStyles.saveColumn}>
                      <Button
                        size="xsmall"
                        variant="secondary"
                        loading={savingLabel === row.label}
                        disabled={(row.mixed && pendingSections[row.label] === undefined) || (!row.mixed && pendingValue === (row.section ?? ''))}
                        onClick={() => handleSave(row.label)}
                      >
                        Lagre
                      </Button>
                    </Table.DataCell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>

          {filteredRows.length > PAGE_SIZE && (
            <Pagination
              page={page}
              onPageChange={setPage}
              count={Math.ceil(filteredRows.length / PAGE_SIZE)}
              boundaryCount={1}
              siblingCount={0}
              size="small"
            />
          )}
        </VStack>
      </div>
    </main>
  )
}

export default Seksjoner
