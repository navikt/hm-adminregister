export type ExportFormat = 'excel' | 'json'

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const columnsFromRows = (rows: Record<string, unknown>[]): string[] => {
  const columns: string[] = []
  const seen = new Set<string>()
  rows.forEach((row) =>
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    })
  )
  return columns
}

export const rowsToJson = (rows: Record<string, unknown>[]): Blob =>
  new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })

export const rowsToXls = (rows: Record<string, unknown>[]): Blob => {
  const columns = columnsFromRows(rows)
  const thead = `<tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>`
  const tbody = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join('')}</tr>`)
    .join('')
  // Plain table: let Excel render its own default (faint) gridlines rather than prominent borders.
  const html = `<html><head><meta charset="UTF-8"></head><body><table>${thead}${tbody}</table></body></html>`
  return new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
}

export const exportRows = (rows: Record<string, unknown>[], format: ExportFormat, fileBaseName: string) => {
  if (format === 'json') {
    downloadBlob(rowsToJson(rows), `${fileBaseName}.json`)
  } else {
    downloadBlob(rowsToXls(rows), `${fileBaseName}.xls`)
  }
}

export const todayIso = (date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Builds a descriptive default file name, e.g. "produkter_LevX_Publisert_2026-09-04".
// Empty/nullish parts are dropped; spaces/underscores in parts become hyphens.
export const buildDefaultFileName = (
  base: string,
  parts: Array<string | null | undefined> = [],
  date = new Date()
): string => {
  const clean = (value: string) =>
    value
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/[\s_]+/g, '-')
      .trim()
  const segments = [base, ...parts.filter((p): p is string => !!p && p.trim() !== '').map(clean), todayIso(date)]
  return segments.filter((seg) => seg.length > 0).join('_')
}

export const sanitizeFileName = (name: string, fallback: string): string => {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || fallback
}

export const formatNumber = (value: number): string => value.toLocaleString('nb-NO')

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
