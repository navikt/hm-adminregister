import { getSeriesBySeriesId, updateProductIso22Category } from 'api/SeriesApi'
import { HM_REGISTER_URL } from 'environments'
import { SeriesDTO } from 'utils/types/response-types'

import { extractErrorMessage } from './errorUtils'
import { IsoOverviewSeriesChunk } from './isoOversiktTypes'

export const SERIES_PAGE_SIZE = 200
export const SERIES_WARN_THRESHOLD = 200
export const DETAIL_FETCH_CONCURRENCY = 20

export const fetchSeriesPage = async (
  page: number,
  pageSize: number,
  isoCode?: string,
  signal?: AbortSignal
): Promise<IsoOverviewSeriesChunk> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: pageSize.toString(),
    sort: 'updated,DESC',
    excludedStatus: 'DELETED',
    excludeExpired: 'true',
    editStatus: 'DONE',
    mainProduct: 'true',
    includeIsoOverview: 'true',
  })
  if (isoCode) params.set('isoCode', isoCode)
  const response = await fetch(`${HM_REGISTER_URL()}/admreg/api/v1/series?${params}`, {
    credentials: 'include',
    signal,
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error(response.statusText || 'Klarte ikke å hente produktserier')
  return (await response.json()) as IsoOverviewSeriesChunk
}

export const fetchSeriesDetailsConcurrent = async (
  seriesIds: string[],
  onProgress: (loaded: number, total: number) => void,
  signal: AbortSignal,
  concurrency = DETAIL_FETCH_CONCURRENCY
): Promise<SeriesDTO[]> => {
  const total = seriesIds.length
  const results: SeriesDTO[] = new Array(total)
  let nextIndex = 0
  let loaded = 0

  const worker = async () => {
    while (nextIndex < total && !signal.aborted) {
      const current = nextIndex++
      results[current] = await getSeriesBySeriesId(seriesIds[current], signal)
      loaded++
      onProgress(loaded, total)
    }
  }

  const workerCount = Math.min(concurrency, total)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

export type BulkMoveResult = {
  succeeded: string[]
  failed: { id: string; error: string }[]
}

// Kobler et sett med produkter til en ISO v22-kategori uten å endre v16-koden - v16 og v22 sameksisterer
// gjennom hele migreringsperioden (se ISO Admin), så dette er en "tilknytning", ikke en "flytting".
export const bulkUpdateIso22Category = async (
  seriesIds: string[],
  newIso22Code: string,
  onProgress: (done: number, total: number) => void,
  concurrency = DETAIL_FETCH_CONCURRENCY
): Promise<BulkMoveResult> => {
  const total = seriesIds.length
  let nextIndex = 0
  let done = 0
  const succeeded: string[] = []
  const failed: { id: string; error: string }[] = []

  const worker = async () => {
    while (nextIndex < total) {
      const current = nextIndex++
      const id = seriesIds[current]
      try {
        await updateProductIso22Category(id, newIso22Code)
        succeeded.push(id)
      } catch (error) {
        failed.push({ id, error: extractErrorMessage(error, 'Ukjent feil oppstod') })
      }
      done++
      onProgress(done, total)
    }
  }

  const workerCount = Math.min(concurrency, total)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return { succeeded, failed }
}
