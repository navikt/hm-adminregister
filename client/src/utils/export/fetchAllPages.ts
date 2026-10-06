import { fetcherGET } from 'utils/swr-hooks'

export const EXPORT_PAGE_SIZE = 100
export const EXPORT_DETAIL_BATCH_SIZE = 20

type PagedResponse<T> = { content?: T[]; totalPages?: number }

export const fetchAllPages = async <T>(
  buildPath: (page: number, pageSize: number) => string,
  pageSize = EXPORT_PAGE_SIZE
): Promise<T[]> => {
  const first = (await fetcherGET(buildPath(0, pageSize))) as PagedResponse<T>
  const totalPages = first.totalPages ?? 1
  const all = [...(first.content || [])]
  for (let page = 1; page < totalPages; page++) {
    const chunk = (await fetcherGET(buildPath(page, pageSize))) as PagedResponse<T>
    all.push(...(chunk.content || []))
  }
  return all
}

export const fetchInBatches = async <I, R>(
  items: I[],
  fetchOne: (item: I) => Promise<R>,
  batchSize = EXPORT_DETAIL_BATCH_SIZE
): Promise<R[]> => {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
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
