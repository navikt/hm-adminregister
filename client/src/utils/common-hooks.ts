import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useUrlSyncedSearchParam = (param: string, defaultValue = '') => {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(param) ?? defaultValue

  const setValue = useCallback(
    (nextValue: string) => {
      const nextParams = new URLSearchParams(searchParams)

      if (nextValue) {
        nextParams.set(param, nextValue)
      } else {
        nextParams.delete(param)
      }

      setSearchParams(nextParams)
    },
    [param, searchParams, setSearchParams]
  )

  return [value, setValue] as const
}
