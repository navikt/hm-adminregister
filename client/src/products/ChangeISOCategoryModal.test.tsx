import type { ComponentProps } from 'react'

import { FlagProvider } from 'toggles/context'
import { expect, test, vi } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'

import ChangeISOCategoryModal from './ChangeISOCategoryModal'

vi.mock('utils/swr-hooks', () => ({
  useActiveIsoCategories: () => ({
    isoCategories: [
      { isoCode: '123490', isoTitle: 'Delkategori' },
      { isoCode: '12345678', isoTitle: 'Produktkategori' },
    ],
  }),
}))

const modal = (props: Partial<ComponentProps<typeof ChangeISOCategoryModal>> = {}, iso22 = false) => (
  <FlagProvider toggles={[{ name: 'finnhjelpemiddel.iso22', enabled: iso22 }]}>
    <ChangeISOCategoryModal isOpen setIsOpen={vi.fn()} onClick={vi.fn()} {...props} />
  </FlagProvider>
)

const selectCategory = async (name = 'Delkategori - 123490') => {
  fireEvent.click(screen.getByRole('combobox', { name: 'ISO-kategori (kode)' }))
  fireEvent.pointerUp(await screen.findByRole('option', { name }))
}

test('parts default to keeping matching technical data without showing the radio group', async () => {
  const onClick = vi.fn()
  render(modal({ isPart: true, onClick }))

  expect(screen.getByRole('checkbox', { name: 'Nullstill tekniske data' })).not.toBeChecked()
  expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  await selectCategory()
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))

  expect(onClick).toHaveBeenCalledExactlyOnceWith('123490', false)
})

test('parts submit true when the checkbox is checked', async () => {
  const onClick = vi.fn()
  render(modal({ isPart: true, onClick }))
  await selectCategory()

  fireEvent.click(screen.getByRole('checkbox', { name: 'Nullstill tekniske data' }))
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))

  expect(onClick).toHaveBeenCalledExactlyOnceWith('123490', true)
})

test.each([true, false])('products retain the radio choices, reset=%s', async (reset) => {
  const onClick = vi.fn()
  render(modal({ onClick }))

  expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'Behold teknisk data som passer ny ISO' })).toBeChecked()
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  await selectCategory('Produktkategori - 12345678')
  if (reset) fireEvent.click(screen.getByRole('radio', { name: 'Nullstill alle felter' }))
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))

  expect(onClick).toHaveBeenCalledExactlyOnceWith('12345678', reset)
})
