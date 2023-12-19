import { useState } from 'react'
import { useErrorHandler } from 'react-error-boundary'
import { http } from './http'
import { Resultat } from './types'

export function usePost<B, T>(url: string): { post(body: B): Promise<void>; reset(): void } & Resultat<T> {
  const [[resultat, loading], setResultat] = useState<[Resultat<T>, boolean]>([{}, false])
  useErrorHandler(resultat.error)
  return {
    async post(body) {
      setResultat([{}, true])
      const resultat = await http.post<B, T>(url, body)
      setResultat([resultat, false])
    },
    reset() {
      setResultat([{}, false])
    },
    ...resultat,
    loading,
  }
}
