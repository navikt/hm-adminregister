import { toHaveNoViolations } from 'jest-axe'
import { server } from 'mocks/server'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'

import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

expect.extend(matchers)
expect.extend(toHaveNoViolations)

vi.mock('environments', () => ({
  HM_REGISTER_URL: vi.fn(() => 'http://localhost:8080'),
  VITE_HM_REGISTER_URL: vi.fn(() => 'http://localhost:8082/imageproxy'),
}))

// jsdom does not implement ResizeObserver. Provide a minimal no-op stub so components using it
// (e.g. width-based dynamic layout) don't crash in tests; tests that need resize behaviour mock
// element widths directly instead of relying on real resize events.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
})

afterAll(() => {
  server.close()
})
