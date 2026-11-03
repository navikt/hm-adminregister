import { MemoryRouter } from 'react-router-dom'

import { useAuthStore } from 'utils/store/useAuthStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'
import { afterEach, describe, expect, test } from 'vitest'

import { fireEvent, render, renderHook, screen } from '@testing-library/react'

import Navbar from './Navbar'
import WideModeToggle from './WideModeToggle'

const logIn = (isAdmin: boolean) => {
  const { result } = renderHook(() => useAuthStore())
  result.current.setLoggedInUser({
    isAdminOrHmsUser: isAdmin,
    isAdmin: isAdmin,
    isHmsUser: false,
    isSupplier: !isAdmin,
    userId: '',
    userName: '',
    exp: '',
    supplierName: '',
    supplierId: '',
  })
}

describe('WideModeToggle', () => {
  afterEach(() => {
    useWideModeStore.getState().setWideMode(false)
    localStorage.clear()
  })

  test('vises ikke for HMS-brukere uten admin- eller leverandørrolle', () => {
    logIn(false)
    useAuthStore.getState().setLoggedInUser({
      ...useAuthStore.getState().loggedInUser!,
      isSupplier: false,
      isHmsUser: true,
      isAdminOrHmsUser: true,
    })
    render(<WideModeToggle />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test.each([true, false])('kan skru bred visning av og paa, admin=%s', (isAdmin) => {
    logIn(isAdmin)
    render(<WideModeToggle />)

    const toggleButton = screen.getByRole('button', { name: /Bred visning/ })
    expect(useWideModeStore.getState().wideMode).toBe(false)

    fireEvent.click(toggleButton)

    expect(useWideModeStore.getState().wideMode).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /Normal visning/ }))

    expect(useWideModeStore.getState().wideMode).toBe(false)
  })

  test.each([
    ['/produkter/serie?tab=variants', true],
    ['/produkter/serie?tab=about', false],
    ['/produkter/serie', false],
    ['/produkter/serie/rediger-variant/variant?tab=variants', false],
    ['/produkter', false],
  ])('leverandørens visningsbryter på %s har synlighet %s', (path, visible) => {
    logIn(false)
    render(
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.queryByRole('button', { name: /Bred visning/ }) !== null).toBe(visible)
  })
})
