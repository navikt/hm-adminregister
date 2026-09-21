import { describe, expect, test, vi } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'

import { ExtendedTechDataDTO } from 'utils/types/response-types'
import TechDataFieldControl, { validationError } from './TechDataFieldControl'

const field = (overrides: Partial<ExtendedTechDataDTO> = {}): ExtendedTechDataDTO => ({
  key: 'bredde',
  value: '',
  unit: 'cm',
  type: 'NUMBER',
  required: false,
  ...overrides,
})

describe('TechDataFieldControl', () => {
  test('renders a number field and reports changes via onChange', () => {
    const onChange = vi.fn()
    render(<TechDataFieldControl techData={field()} value="10" onChange={onChange} label="Bredde" />)

    const input = screen.getByDisplayValue('10')
    fireEvent.change(input, { target: { value: '12' } })

    expect(onChange).toHaveBeenCalledWith('12')
  })

  test('renders options as a select with the provided choices', () => {
    const onChange = vi.fn()
    render(
      <TechDataFieldControl
        techData={field({ type: 'OPTIONS', options: ['Liten', 'Stor'] })}
        value=""
        onChange={onChange}
        label="Størrelse"
      />
    )

    expect(screen.getByRole('option', { name: 'Liten' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Stor' })).toBeInTheDocument()
  })

  test('renders a boolean field as Ja/Nei select', () => {
    render(<TechDataFieldControl techData={field({ type: 'BOOLEAN' })} value="" onChange={vi.fn()} label="Har hjul" />)

    expect(screen.getByRole('option', { name: 'Ja' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Nei' })).toBeInTheDocument()
  })
})

describe('validationError', () => {
  test('returns an error when a required field is empty', () => {
    expect(validationError(field({ required: true }), '')).toBe('bredde er påkrevd')
  })

  test('returns undefined when an optional field is empty', () => {
    expect(validationError(field({ required: false }), '')).toBeUndefined()
  })

  test('rejects a dot-decimal number and suggests a comma', () => {
    expect(validationError(field(), '1.5')).toBe('Bruk komma som desimalskilletegn f.eks. 1,5')
  })

  test('accepts a comma-decimal number', () => {
    expect(validationError(field(), '1,5')).toBeUndefined()
  })

  test('rejects a non-numeric value for a NUMBER field', () => {
    expect(validationError(field(), 'abc')).toBe('Må være et tall')
  })

  test('does not apply number validation to TEXT fields', () => {
    expect(validationError(field({ type: 'TEXT' }), 'abc')).toBeUndefined()
  })
})
