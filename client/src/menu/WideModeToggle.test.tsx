import { afterEach, describe, expect, test } from 'vitest'

import { useAuthStore } from 'utils/store/useAuthStore'
import { useWideModeStore } from 'utils/store/useWideModeStore'

import { fireEvent, render, renderHook, screen } from '@testing-library/react'

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
    localStorage.clear()
  })

  test('vises ikke for leverandørbrukere', () => {
    logIn(false)
    render(<WideModeToggle />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  test('admin kan skru bred visning av og paa', () => {
    logIn(true)
    render(<WideModeToggle />)

    const toggleButton = screen.getByRole('button', { name: /Bred visning/ })
    expect(useWideModeStore.getState().wideMode).toBe(false)

    fireEvent.click(toggleButton)

    expect(useWideModeStore.getState().wideMode).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /Normal visning/ }))

    expect(useWideModeStore.getState().wideMode).toBe(false)
  })
})
