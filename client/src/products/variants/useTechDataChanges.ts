import { useCallback, useMemo, useState } from 'react'

import { BulkTechDataUpdateDTO, ExtendedTechDataDTO, ProductRegistrationDTOV2 } from 'utils/types/response-types'

export type TechDataChange = {
  productId: string
  key: string
  value: string
}

const changeKey = (productId: string, key: string) => `${productId}::${key}`

export function useTechDataChanges() {
  // Map is keyed by "productId::key" so we never need to worry about ordering/duplicates.
  const [changes, setChanges] = useState<Map<string, TechDataChange>>(new Map())

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

  const clearAll = useCallback(() => setChanges(new Map()), [])

  const changedProductIds = useMemo(() => {
    return Array.from(new Set(Array.from(changes.values()).map((change) => change.productId)))
  }, [changes])

  const changeCount = changes.size

  const buildBulkUpdateDTO = useCallback(
    (variantsById: Map<string, ProductRegistrationDTOV2>): BulkTechDataUpdateDTO => {
      const updates = changedProductIds
        .map((productId) => {
          const variant = variantsById.get(productId)
          if (!variant) return null
          const techData: ExtendedTechDataDTO[] = variant.productData.techData.map((field) => {
            const change = changes.get(changeKey(productId, field.key))
            return change ? { ...field, value: change.value.trim() } : field
          })
          return { productId, techData, version: variant.version ?? null }
        })
        .filter(
          (update): update is { productId: string; techData: ExtendedTechDataDTO[]; version: number | null } =>
            update !== null
        )

      return { updates }
    },
    [changes, changedProductIds]
  )

  return {
    getValue,
    setValue,
    isChanged,
    clearForProducts,
    clearAll,
    changedProductIds,
    changeCount,
    buildBulkUpdateDTO,
  }
}
