import { getSeriesBySeriesId } from 'api/SeriesApi'
import { HM_REGISTER_URL } from 'environments'
import { SeriesDTO } from 'utils/types/response-types'

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
