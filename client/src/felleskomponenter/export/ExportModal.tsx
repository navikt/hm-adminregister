import { useEffect, useState } from 'react'

import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  HGrid,
  HStack,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  VStack
} from '@navikt/ds-react'

import { ExportFormat, exportRows, formatBytes, formatNumber, sanitizeFileName } from 'utils/export/exportUtils'

export type ExportField = { key: string; label: string }
export type ExportScope = 'page' | 'all'
export type ExportLevel = {
  key: string
  label: string
  availableFields: ExportField[]
  defaultFieldKeys?: string[]
}
export type ExportEstimate = {
  /** Number of rows the export will contain (products or variants, per level). */
  rows: number
  /** Underlying product count (for context when rows are variants). */
  products?: number
  /** Approx number of network requests generating the export will make (for time estimate). */
  requests?: number
  /** Whether the row count is an approximation. */
  approximate?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  fileBaseName: string
  /** Single-level mode: provide fields directly. */
  availableFields?: ExportField[]
  defaultFieldKeys?: string[]
  /** Multi-level mode: provide levels (e.g. Produkt/Variant); takes precedence over availableFields. */
  levels?: ExportLevel[]
  showScope?: boolean
  scopeLabels?: { page: string; all: string }
  /** Returns one record per item, keyed by field.key, containing every available field for the level. */
  getRows: (scope: ExportScope, level?: string) => Promise<Record<string, unknown>[]>
  /** Optional instant magnitude estimate shown before exporting. */
  estimate?: (scope: ExportScope, level?: string) => ExportEstimate
  /** True when no filters/supplier/search are set (full-catalogue export) — triggers a stronger warning. */
  isUnfiltered?: boolean
  /** Row count above which a warning (instead of info) is shown. Default 2000. */
  warnRowThreshold?: number
  /** Noun for a row in single-level mode (e.g. "varianter"). Multi-level derives from the level key. */
  rowNoun?: string
}

const keysOf = (fields: ExportField[], defaults?: string[]) => defaults ?? fields.map((field) => field.key)

export const ExportModal = ({
  open,
  onClose,
  fileBaseName,
  availableFields,
  defaultFieldKeys,
  levels,
  showScope = true,
  scopeLabels,
  getRows,
  estimate,
  isUnfiltered = false,
  warnRowThreshold = 2000,
  rowNoun,
}: Props) => {
  const hasLevels = !!levels && levels.length > 0
  const [levelKey, setLevelKey] = useState<string>(hasLevels ? levels![0].key : '')

  const currentLevel = hasLevels ? levels!.find((level) => level.key === levelKey) ?? levels![0] : undefined
  const fields = currentLevel?.availableFields ?? availableFields ?? []

  const [format, setFormat] = useState<ExportFormat>('excel')
  const [scope, setScope] = useState<ExportScope>('page')
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    currentLevel ? keysOf(currentLevel.availableFields, currentLevel.defaultFieldKeys) : keysOf(fields, defaultFieldKeys)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>(fileBaseName)

  // Reset transient state each time the modal is opened (avoid a stale error / accidental huge scope).
  useEffect(() => {
    if (open) {
      setError(null)
      setScope('page')
      setFileName(fileBaseName)
    }
  }, [open, fileBaseName])

  const est = estimate ? estimate(scope, hasLevels ? levelKey : undefined) : null

  const rowNounResolved = hasLevels
    ? levelKey === 'variant'
      ? 'varianter'
      : 'produkter'
    : rowNoun ?? 'rader'

  const estimatedBytes = est ? est.rows * (selectedKeys.length * 16 + 24) + 64 : 0
  const estimatedRequests = est?.requests ?? 0
  const estimatedSeconds = Math.max(1, Math.round(estimatedRequests * 0.5))
  const timeText =
    estimatedRequests <= 1
      ? 'noen sekunder'
      : estimatedSeconds < 60
        ? `~${estimatedSeconds} sekunder`
        : `~${Math.ceil(estimatedSeconds / 60)} min`
  const isLargeExport = !!est && (est.rows > warnRowThreshold || isUnfiltered)

  const onLevelChange = (key: string) => {
    setLevelKey(key)
    const level = levels!.find((candidate) => candidate.key === key)
    if (level) setSelectedKeys(keysOf(level.availableFields, level.defaultFieldKeys))
  }

  const handleExport = async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getRows(scope, hasLevels ? levelKey : undefined)
      const selectedFields = fields.filter((field) => selectedKeys.includes(field.key))
      const projected = rows.map((row) => {
        const out: Record<string, unknown> = {}
        selectedFields.forEach((field) => {
          out[field.label] = row[field.key] ?? ''
        })
        return out
      })
      if (projected.length === 0) {
        setError('Fant ingen rader å eksportere')
        return
      }
      exportRows(projected, format, sanitizeFileName(fileName, fileBaseName))
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eksport feilet')
    } finally {
      setLoading(false)
    }
  }

  const radioColumns = 1 + (hasLevels ? 1 : 0) + (showScope ? 1 : 0)

  return (
    <Modal open={open} onClose={onClose} header={{ heading: 'Eksporter', closeButton: true }} width="medium">
      <Modal.Body>
        <VStack gap="space-24">
          <HGrid columns={{ xs: 1, sm: radioColumns }} gap="space-24" align="start">
            <RadioGroup legend="Format" value={format} onChange={(value: ExportFormat) => setFormat(value)}>
              <Radio value="excel">Excel (.xls)</Radio>
              <Radio value="json">JSON</Radio>
            </RadioGroup>

            {hasLevels && (
              <RadioGroup legend="Nivå" value={levelKey} onChange={onLevelChange}>
                {levels!.map((level) => (
                  <Radio key={level.key} value={level.key}>
                    {level.label}
                  </Radio>
                ))}
              </RadioGroup>
            )}

            {showScope && (
              <RadioGroup legend="Omfang" value={scope} onChange={(value: ExportScope) => setScope(value)}>
                <Radio value="page">{scopeLabels?.page ?? 'Denne siden'}</Radio>
                <Radio value="all">{scopeLabels?.all ?? 'Alle treff'}</Radio>
              </RadioGroup>
            )}
          </HGrid>

          <TextField
            label="Filnavn"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            description={`Lagres som ${fileName || fileBaseName}.${format === 'json' ? 'json' : 'xls'}`}
          />

          <CheckboxGroup legend="Felter" value={selectedKeys} onChange={setSelectedKeys}>
            <HGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="space-8 space-24">
              {fields.map((field) => (
                <Checkbox key={field.key} value={field.key}>
                  {field.label}
                </Checkbox>
              ))}
            </HGrid>
          </CheckboxGroup>

          {error && <Alert variant="error">{error}</Alert>}
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <VStack gap="space-16" width="100%" style={{ width: '100%' }}>
          <HStack gap="space-8">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Avbryt
            </Button>
            <Button onClick={handleExport} loading={loading} disabled={selectedKeys.length === 0}>
              Eksporter
            </Button>
          </HStack>
          {est && (
            <Alert variant={isLargeExport ? 'warning' : 'info'} size="small" style={{ width: '100%' }}>
              <VStack gap="space-2">
                {isUnfiltered && (
                  <BodyShort size="small" weight="semibold">
                    Ingen filtre er satt – hele katalogen eksporteres.
                  </BodyShort>
                )}
                <BodyShort size="small">
                  Eksporten inneholder {est.approximate ? 'ca. ' : ''}
                  {formatNumber(est.rows)} {rowNounResolved}
                  {est.approximate && est.products !== undefined
                    ? ` (basert på ${formatNumber(est.products)} produkter)`
                    : ''}
                  .
                </BodyShort>
                <BodyShort size="small">Anslått filstørrelse ~{formatBytes(estimatedBytes)}. Kan ta {timeText} å generere.</BodyShort>
              </VStack>
            </Alert>
          )}
        </VStack>
      </Modal.Footer>
    </Modal>
  )
}

export default ExportModal
