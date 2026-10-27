import { useFlag } from 'toggles/context'
import { SeriesDTO } from 'utils/types/response-types'

export type IsoVersion = 'v16' | 'v22'

export function useIsoVersion(): IsoVersion {
  return useFlag('finnhjelpemiddel.iso22').enabled ? 'v22' : 'v16'
}

export const withIsoVersion = (url: string, version: IsoVersion = 'v16') =>
  `${url}${url.includes('?') ? '&' : '?'}isoVersion=${version}`

export const isoCategoryFields = (code: string, version: IsoVersion) =>
  version === 'v22' ? { isoCategory: '', isoCategory22: code } : { isoCategory: code }

export const isoCategoryOf = (series: SeriesDTO | undefined, version: IsoVersion) =>
  version === 'v22' ? series?.isoCategory22 : series?.isoCategory
