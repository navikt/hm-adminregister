import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import type { BeregnSatsRequest, BeregnSatsResponse, Brilleseddel } from '../types'
import { usePost } from '../usePost'

export function useBeregning(): BeregnSatsResponse | undefined {
  const { watch } = useFormContext<{ brillestyrke: Brilleseddel }>()
  const høyreSfære = watch('brillestyrke.høyreSfære')
  const høyreSylinder = watch('brillestyrke.høyreSylinder')
  const venstreSfære = watch('brillestyrke.venstreSfære')
  const venstreSylinder = watch('brillestyrke.venstreSylinder')

  const { post, data, reset } = usePost<BeregnSatsRequest, BeregnSatsResponse>('/brillesedler')

  useEffect(() => {
    if (høyreSfære && høyreSylinder && venstreSfære && venstreSylinder) {
      post({
        høyreSfære,
        høyreSylinder,
        venstreSfære,
        venstreSylinder,
      }).catch(() => reset())
    } else if (data) {
      reset()
    }
  }, [høyreSfære, høyreSylinder, venstreSfære, venstreSylinder])

  return data
}
