import { getSeriesBySeriesId } from 'api/SeriesApi'
import { HM_REGISTER_URL } from 'environments'
import { SeriesDTO } from 'utils/types/response-types'

import { IsoOverviewSeries, IsoOverviewSeriesChunk } from './isoOversiktTypes'

export const SERIES_PAGE_SIZE = 200
export const SERIES_WARN_THRESHOLD = 200
export const DETAIL_FETCH_CONCURRENCY = 20

export const fetchSeriesPage = async (
  page: number,
  pageSize: number,
  isoCode?: string,
  signal?: AbortSignal,
  isoVersion: 'v16' | 'v22' = 'v16'
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
  if (isoCode) params.set(isoVersion === 'v22' ? 'isoCode22' : 'isoCode', isoCode)
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

export const fetchSeriesForIsoCode = async (
  isoCode: string,
  onProgress: (loaded: number, total: number) => void,
  signal: AbortSignal,
  isoVersion: 'v16' | 'v22' = 'v16',
  firstChunk?: IsoOverviewSeriesChunk
): Promise<(SeriesDTO | IsoOverviewSeries)[]> => {
  const first = firstChunk ?? (await fetchSeriesPage(0, SERIES_PAGE_SIZE, isoCode, signal, isoVersion))
  const series = [...(first.content ?? [])]
  for (let page = 1; page < (first.totalPages || 1); page++) {
    signal.throwIfAborted()
    const chunk = await fetchSeriesPage(page, SERIES_PAGE_SIZE, isoCode, signal, isoVersion)
    series.push(...(chunk.content ?? []))
  }
  const complete = series.every(
    (item) =>
      typeof item.isoCategory === 'string' &&
      Array.isArray(item.variants) &&
      (isoVersion === 'v16' || item.isoCategory22 !== undefined)
  )
  const details = complete
    ? series
    : await fetchSeriesDetailsConcurrent(
        series.map((item) => item.id),
        onProgress,
        signal
      )
  signal.throwIfAborted()
  const normalized = isoCode.replace(/\s/g, '')
  return details.filter((item) => {
    const category = isoVersion === 'v22' ? item.isoCategory22 : item.isoCategory
    const code = typeof category === 'string' ? category : (category?.isoCode ?? '')
    return code.replace(/\s/g, '').startsWith(normalized)
  })
}
