import { server } from 'mocks/server'
import { HttpResponse, http } from 'msw'
import { expect, test } from 'vitest'

import { renderHook, waitFor } from '@testing-library/react'
import { buildSeriesSearchPath } from 'utils/export/seriesSearchPath'
import { usePagedProducts } from 'utils/swr-hooks'

// Both usePagedProducts (the visible product list) and buildSeriesSearchPath (the "Alle treff"
// export path) must build the exact same query string for the same inputs — including encoding of
// free-text search terms — otherwise the list and the export can silently diverge on special
// characters such as "&", "#" or "+".
const searchParams = {
  page: 0,
  pageSize: 50,
  titleSearchTerm: 'rullestol & rampe #1',
  filters: [] as string[],
  supplierFilter: undefined,
  sortUrl: null,
  agreementFilter: null,
  missingMediaType: null,
}

test('usePagedProducts sender nøyaktig samme, url-encodede sti som buildSeriesSearchPath', async () => {
  let requestedUrl: string | undefined
  server.use(
    http.get('http://localhost:8080/admreg/api/v1/series', (info) => {
      requestedUrl = info.request.url
      return HttpResponse.json({ content: [], totalSize: 0, totalPages: 1 })
    })
  )

  renderHook(() => usePagedProducts(searchParams))

  await waitFor(() => expect(requestedUrl).toBeDefined())

  const expectedPath = buildSeriesSearchPath(searchParams)
  expect(requestedUrl).toBe(expectedPath)
  expect(requestedUrl).toContain(`title=${encodeURIComponent(searchParams.titleSearchTerm)}`)
  expect(requestedUrl).not.toContain('title=rullestol & rampe #1')
})
