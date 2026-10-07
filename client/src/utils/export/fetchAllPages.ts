import { fetchAPI } from 'api/fetch'

export const EXPORT_PAGE_SIZE = 100
export const EXPORT_DETAIL_BATCH_SIZE = 20
/** Above this many HTTP requests (page and detail requests together) an export is blocked to protect the backend. */
export const MAX_EXPORT_REQUESTS = 3000
/** Observed time per sequential round trip (one page, or one batch of parallel detail requests). */
export const SECONDS_PER_ROUND = 0.5

/** Page requests fetchAllPages made for `itemCount` items (at least one, even for an empty result). */
export const pageRequestsFor = (itemCount: number, pageSize = EXPORT_PAGE_SIZE) =>
  Math.max(1, Math.ceil(itemCount / pageSize))

type PagedResponse<T> = { content?: T[]; totalPages?: number }

// fetchAPI rejects with a plain { message } object; ExportModal only shows the message of an Error.
export const rethrowAsError = (error: unknown): never => {
  if (error instanceof Error) throw error
  const message = (error as { message?: unknown } | null)?.message
  throw new Error(typeof message === 'string' && message ? message : 'Eksport feilet')
}

const fetchPage = <T>(path: string, signal?: AbortSignal) =>
  (fetchAPI(path, 'GET', undefined, signal) as Promise<PagedResponse<T>>).catch(rethrowAsError)

export const fetchAllPages = async <T>(
  buildPath: (page: number, pageSize: number) => string,
  pageSize = EXPORT_PAGE_SIZE,
  signal?: AbortSignal
): Promise<T[]> => {
  const first = await fetchPage<T>(buildPath(0, pageSize), signal)
  const totalPages = first.totalPages ?? 1
  const all = [...(first.content || [])]
  for (let page = 1; page < totalPages; page++) {
    const chunk = await fetchPage<T>(buildPath(page, pageSize), signal)
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
    results.push(...(await Promise.all(batch.map(fetchOne)).catch(rethrowAsError)))
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
