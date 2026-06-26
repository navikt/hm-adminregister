import { describe, expect, it } from 'vitest'

import { getMissingRequiredTechData } from 'utils/product-util'
import { ProductRegistrationDTOV2, TechDataType } from 'utils/types/response-types'

const makeVariant = (
  articleName: string,
  techData: { key: string; value: string; required: boolean; type?: TechDataType }[]
): ProductRegistrationDTOV2 =>
  ({
    articleName,
    productData: {
      techData: techData.map((t) => ({
        key: t.key,
        value: t.value,
        required: t.required,
        unit: '',
        type: t.type ?? 'TEXT',
      })),
      attributes: {},
    },
  }) as unknown as ProductRegistrationDTOV2

describe('getMissingRequiredTechData', () => {
  it('returnerer tom liste når ingen varianter finnes', () => {
    expect(getMissingRequiredTechData([])).toEqual([])
  })

  it('returnerer tom liste når alle påkrevde felt er fylt ut', () => {
    const variants = [makeVariant('Variant A', [{ key: 'Vekt', value: '5', required: true }])]
    expect(getMissingRequiredTechData(variants)).toEqual([])
  })

  it('returnerer manglende påkrevde felt', () => {
    const variants = [makeVariant('Variant A', [{ key: 'Vekt', value: '', required: true }])]
    expect(getMissingRequiredTechData(variants)).toEqual([{ key: 'Vekt', variants: ['Variant A'] }])
  })

  it('ignorerer ikke-påkrevde felt som er tomme', () => {
    const variants = [makeVariant('Variant A', [{ key: 'Farge', value: '', required: false }])]
    expect(getMissingRequiredTechData(variants)).toEqual([])
  })

  it('behandler whitespace-only verdier som tomme', () => {
    const variants = [makeVariant('Variant A', [{ key: 'Vekt', value: '   ', required: true }])]
    expect(getMissingRequiredTechData(variants)).toEqual([{ key: 'Vekt', variants: ['Variant A'] }])
  })

  it('grupperer samme felt på tvers av varianter', () => {
    const variants = [
      makeVariant('Variant A', [{ key: 'Vekt', value: '', required: true }]),
      makeVariant('Variant B', [{ key: 'Vekt', value: '', required: true }]),
    ]
    expect(getMissingRequiredTechData(variants)).toEqual([{ key: 'Vekt', variants: ['Variant A', 'Variant B'] }])
  })

  it('inkluderer bare varianter som mangler verdien, ikke de som har den', () => {
    const variants = [
      makeVariant('Variant A', [{ key: 'Vekt', value: '5', required: true }]),
      makeVariant('Variant B', [{ key: 'Vekt', value: '', required: true }]),
    ]
    expect(getMissingRequiredTechData(variants)).toEqual([{ key: 'Vekt', variants: ['Variant B'] }])
  })

  it('sorterer resultat alfabetisk på norsk (nb)', () => {
    const variants = [
      makeVariant('Variant A', [
        { key: 'Ål', value: '', required: true },
        { key: 'Vekt', value: '', required: true },
        { key: 'Bredde', value: '', required: true },
      ]),
    ]
    const keys = getMissingRequiredTechData(variants).map((f) => f.key)
    expect(keys).toEqual(['Bredde', 'Vekt', 'Ål'])
  })

  it('håndterer variant uten teknisk data', () => {
    const variants = [makeVariant('Variant A', [])]
    expect(getMissingRequiredTechData(variants)).toEqual([])
  })
})
