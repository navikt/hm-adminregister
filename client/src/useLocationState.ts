import { useLocation } from 'react-router-dom'

export function useLocationState<T = unknown>(): T | null | undefined {
  const { state } = useLocation()
  return state as T
}
