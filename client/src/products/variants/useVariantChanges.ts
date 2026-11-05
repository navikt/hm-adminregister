import { useCallback, useMemo, useState } from 'react'

import {
  BulkVariantUpdateDTO,
  ExtendedTechDataDTO,
  ProductRegistrationDTOV2,
  VariantUpdate,
} from 'utils/types/response-types'

export type TechDataChange = {
  productId: string
  key: string
  value: string
}

const changeKey = (productId: string, key: string) => `${productId}::${key}`

export function useVariantChanges() {
  // Map is keyed by "productId::key" so we never need to worry about ordering/duplicates.
  const [changes, setChanges] = useState<Map<string, TechDataChange>>(new Map())
  const [articleNames, setArticleNames] = useState<Map<string, string>>(new Map())
  const [hmsNumbers, setHmsNumbers] = useState<Map<string, string>>(new Map())
  const [supplierRefs, setSupplierRefs] = useState<Map<string, string>>(new Map())

  const setArticleName = useCallback((productId: string, value: string) => {
    setArticleNames((prev) => new Map(prev).set(productId, value))
  }, [])

  const getArticleName = (productId: string, fallback: string): string => articleNames.get(productId) ?? fallback

  const setHmsArtNr = useCallback((productId: string, value: string) => {
    setHmsNumbers((prev) => new Map(prev).set(productId, value))
  }, [])

  const getHmsArtNr = (productId: string, fallback: string): string => hmsNumbers.get(productId) ?? fallback

  const setSupplierRef = useCallback((productId: string, value: string) => {
    setSupplierRefs((prev) => new Map(prev).set(productId, value))
  }, [])

  const getSupplierRef = (productId: string, fallback: string): string => supplierRefs.get(productId) ?? fallback

  const supplierRefErrors = useMemo(() => {
    const errors = new Map<string, string>()
    supplierRefs.forEach((value, productId) => {
      if (!value.trim()) errors.set(productId, 'Artikkelnummer er påkrevd')
    })
    return errors
  }, [supplierRefs])

  const articleNameErrors = useMemo(() => {
    const errors = new Map<string, string>()
    articleNames.forEach((value, productId) => {
      if (!value.trim()) {
        errors.set(productId, 'Variantnavn er påkrevd')
      } else if (value.trim().length > 1024) {
        errors.set(productId, 'Variantnavn kan ikke være lengre enn 1024 tegn')
      }
    })
    return errors
  }, [articleNames])

  const setValue = useCallback((productId: string, key: string, value: string) => {
    setChanges((prev) => {
      const next = new Map(prev)
      next.set(changeKey(productId, key), { productId, key, value })
      return next
    })
  }, [])

  const getValue = useCallback(
    (productId: string, key: string, fallback: string): string => {
      return changes.get(changeKey(productId, key))?.value ?? fallback
    },
    [changes]
  )

  const isChanged = useCallback(
    (productId: string, key: string): boolean => changes.has(changeKey(productId, key)),
    [changes]
  )

  // Removes only the changes belonging to the given productIds - used after a partially
  // successful save, so edits for variants that failed to save are kept for the admin to retry,
  // while edits for variants that saved successfully are cleared.
  const clearForProducts = useCallback((productIds: string[]) => {
    setSupplierRefs((prev) => {
      const next = new Map(prev)
      productIds.forEach((productId) => next.delete(productId))
      return next
    })
    setHmsNumbers((prev) => {
      const next = new Map(prev)
      productIds.forEach((productId) => next.delete(productId))
      return next
    })
    setArticleNames((prev) => {
      const next = new Map(prev)
      productIds.forEach((productId) => next.delete(productId))
      return next
    })
    setChanges((prev) => {
      const idsToClear = new Set(productIds)
      const next = new Map<string, TechDataChange>()
      prev.forEach((change, key) => {
        if (!idsToClear.has(change.productId)) {
          next.set(key, change)
        }
      })
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setChanges(new Map())
    setArticleNames(new Map())
    setHmsNumbers(new Map())
    setSupplierRefs(new Map())
  }, [])

  const changedProductIds = useMemo(() => {
    return Array.from(
      new Set([
        ...Array.from(changes.values()).map((change) => change.productId),
        ...articleNames.keys(),
        ...hmsNumbers.keys(),
        ...supplierRefs.keys(),
      ])
    )
  }, [changes, articleNames, hmsNumbers, supplierRefs])

  const changeCount = changes.size + articleNames.size + hmsNumbers.size + supplierRefs.size

  const buildBulkUpdateDTO = useCallback(
    (variantsById: Map<string, ProductRegistrationDTOV2>, isAdmin = false): BulkVariantUpdateDTO => {
      const updates = changedProductIds
        .map((productId): VariantUpdate | null => {
          const variant = variantsById.get(productId)
          if (!variant) return null
          const techData: ExtendedTechDataDTO[] = variant.productData.techData.map((field) => {
            const change = changes.get(changeKey(productId, field.key))
            return change ? { ...field, value: change.value.trim() } : field
          })
          const articleName = articleNames.get(productId)
          const hmsArtNr = hmsNumbers.get(productId)
          const supplierRef = supplierRefs.get(productId)
          return {
            productId,
            techData,
            version: variant.version ?? null,
            ...(articleName !== undefined ? { articleName: articleName.trim() } : {}),
            ...(isAdmin && hmsArtNr !== undefined ? { hmsArtNr: hmsArtNr.trim() } : {}),
            ...((isAdmin || !variant.isPublished) && supplierRef !== undefined
              ? { supplierRef: supplierRef.trim() }
              : {}),
          }
        })
        .filter((update): update is VariantUpdate => update !== null)

      return { updates }
    },
    [changes, changedProductIds, articleNames, hmsNumbers, supplierRefs]
  )

  return {
    getValue,
    setValue,
    getArticleName,
    setArticleName,
    getHmsArtNr,
    setHmsArtNr,
    getSupplierRef,
    setSupplierRef,
    supplierRefErrors,
    articleNameErrors,
    isChanged,
    clearForProducts,
    clearAll,
    changedProductIds,
    changeCount,
    buildBulkUpdateDTO,
  }
}
