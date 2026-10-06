import { fetchAPI } from 'api/fetch'

export const EXPORT_PAGE_SIZE = 100
export const EXPORT_DETAIL_BATCH_SIZE = 20
/** Above this many HTTP requests (~5 min) an export is blocked to protect the backend. */
export const MAX_EXPORT_REQUESTS = 2000
/** Observed time per sequential round trip (one page, or one batch of parallel detail requests). */
export const SECONDS_PER_ROUND = 0.5

type PagedResponse<T> = { content?: T[]; totalPages?: number }

export const fetchAllPages = async <T>(
  buildPath: (page: number, pageSize: number) => string,
  pageSize = EXPORT_PAGE_SIZE,
  signal?: AbortSignal
): Promise<T[]> => {
  const first = (await fetchAPI(buildPath(0, pageSize), 'GET', undefined, signal)) as PagedResponse<T>
  const totalPages = first.totalPages ?? 1
  const all = [...(first.content || [])]
  for (let page = 1; page < totalPages; page++) {
    const chunk = (await fetchAPI(buildPath(page, pageSize), 'GET', undefined, signal)) as PagedResponse<T>
    all.push(...(chunk.content || []))
  }
  return all
}

export const fetchInBatches = async <I, R>(
  items: I[],
  fetchOne: (item: I) => Promise<R>,
  batchSize = EXPORT_DETAIL_BATCH_SIZE,
  signal?: AbortSignal
): Promise<R[]> => {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    signal?.throwIfAborted()
    const batch = items.slice(i, i + batchSize)
    results.push(...(await Promise.all(batch.map(fetchOne))))
  }
  return results
}

export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size))
  return chunks
}

export const uniqueIds = (ids: Array<string | null | undefined>): string[] =>
  Array.from(new Set(ids.filter((id): id is string => !!id)))
