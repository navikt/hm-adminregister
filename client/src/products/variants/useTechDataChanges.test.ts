import { describe, expect, test } from 'vitest'

import { act, renderHook } from '@testing-library/react'

import { ExtendedTechDataDTO, ProductRegistrationDTOV2 } from 'utils/types/response-types'
import { useTechDataChanges } from './useTechDataChanges'

const techDataField = (key: string, value: string): ExtendedTechDataDTO => ({
  key,
  value,
  unit: 'cm',
  type: 'NUMBER',
  required: false,
})

const variant = (id: string, techData: ExtendedTechDataDTO[]): ProductRegistrationDTOV2 =>
  ({
    id,
    productData: { techData },
  }) as ProductRegistrationDTOV2

describe('useTechDataChanges', () => {
  test('has no changes initially', () => {
    const { result } = renderHook(() => useTechDataChanges())

    expect(result.current.changeCount).toBe(0)
    expect(result.current.changedProductIds).toEqual([])
    expect(result.current.getValue('p1', 'bredde', 'fallback')).toBe('fallback')
    expect(result.current.isChanged('p1', 'bredde')).toBe(false)
  })

  test('setValue records a change and getValue/isChanged reflect it', () => {
    const { result } = renderHook(() => useTechDataChanges())

    act(() => result.current.setValue('p1', 'bredde', '42'))

    expect(result.current.changeCount).toBe(1)
    expect(result.current.changedProductIds).toEqual(['p1'])
    expect(result.current.getValue('p1', 'bredde', 'fallback')).toBe('42')
    expect(result.current.isChanged('p1', 'bredde')).toBe(true)
    // Unrelated key/product must be unaffected.
    expect(result.current.isChanged('p1', 'hoyde')).toBe(false)
    expect(result.current.isChanged('p2', 'bredde')).toBe(false)
  })

  test('setValue overwrites a previous change for the same productId/key', () => {
    const { result } = renderHook(() => useTechDataChanges())

    act(() => result.current.setValue('p1', 'bredde', '42'))
    act(() => result.current.setValue('p1', 'bredde', '43'))

    expect(result.current.changeCount).toBe(1)
    expect(result.current.getValue('p1', 'bredde', 'fallback')).toBe('43')
  })

  test('clearForProducts only clears changes for the given productIds', () => {
    const { result } = renderHook(() => useTechDataChanges())

    act(() => {
      result.current.setValue('p1', 'bredde', '42')
      result.current.setValue('p2', 'bredde', '10')
    })

    act(() => result.current.clearForProducts(['p1']))

    expect(result.current.isChanged('p1', 'bredde')).toBe(false)
    expect(result.current.isChanged('p2', 'bredde')).toBe(true)
    expect(result.current.changeCount).toBe(1)
  })

  test('clearAll removes every change', () => {
    const { result } = renderHook(() => useTechDataChanges())

    act(() => {
      result.current.setValue('p1', 'bredde', '42')
      result.current.setValue('p2', 'bredde', '10')
    })

    act(() => result.current.clearAll())

    expect(result.current.changeCount).toBe(0)
    expect(result.current.changedProductIds).toEqual([])
  })

  test('buildBulkUpdateDTO sends the full tech data array per touched product, with only changed values overridden', () => {
    const { result } = renderHook(() => useTechDataChanges())

    const p1 = variant('p1', [techDataField('bredde', '10'), techDataField('hoyde', '20')])
    const p2 = variant('p2', [techDataField('bredde', '5')])
    const variantsById = new Map([
      ['p1', p1],
      ['p2', p2],
    ])

    act(() => result.current.setValue('p1', 'bredde', '99'))

    const dto = result.current.buildBulkUpdateDTO(variantsById)

    // Only p1 was touched, so only p1 should be in the payload.
    expect(dto.updates).toHaveLength(1)
    expect(dto.updates[0].productId).toBe('p1')
    // Full tech data array is sent, with only the changed key updated.
    expect(dto.updates[0].techData).toEqual([techDataField('bredde', '99'), techDataField('hoyde', '20')])
  })

  test('buildBulkUpdateDTO skips productIds that are no longer present in variantsById', () => {
    const { result } = renderHook(() => useTechDataChanges())

    act(() => result.current.setValue('missing-product', 'bredde', '99'))

    const dto = result.current.buildBulkUpdateDTO(new Map())

    expect(dto.updates).toEqual([])
  })
})
