import { IsoCategory22DTO, IsoCategoryDTO } from 'utils/types/response-types'

import { Iso22Path, IsoPath } from './isoOversiktTypes'

export const getParentCategory = (
  child: IsoCategoryDTO,
  categories: IsoCategoryDTO[],
  parentLevel: number
): IsoCategoryDTO | undefined => {
  const childCode = child.isoCode.replace(/\s/g, '')
  const prefix = childCode.slice(0, parentLevel * 2)
  const category = categories.find((it) => it.isoLevel === parentLevel && it.isoCode.replace(/\s/g, '') === prefix)

  return category
}

export const buildIsoPath = (isoCode: string, categories: IsoCategoryDTO[]): IsoPath => {
  const normalizedCode = isoCode.replace(/\s/g, '')
  const current = categories.find((it) => it.isoCode.replace(/\s/g, '') === normalizedCode)
  if (!current) return {}
  if (current.isoLevel === 1) return { level1: current }
  if (current.isoLevel === 2) {
    const level1 = getParentCategory(current, categories, 1)
    return { level1, level2: current }
  }
  if (current.isoLevel === 3) {
    const level2 = getParentCategory(current, categories, 2)
    const level1 = level2 ? getParentCategory(level2, categories, 1) : undefined
    return { level1, level2, level3: current }
  }
  const level3 = getParentCategory(current, categories, 3)
  const level2 = level3 ? getParentCategory(level3, categories, 2) : undefined
  const level1 = level2 ? getParentCategory(level2, categories, 1) : undefined
  return { level1, level2, level3, level4: current }
}

export const getParentCategory22 = (
  child: IsoCategory22DTO,
  categories: IsoCategory22DTO[],
  parentLevel: number
): IsoCategory22DTO | undefined => {
  const childCode = child.isoCode.replace(/\s/g, '')
  const category = categories
    .filter((it) => it.isoLevel === parentLevel && childCode.startsWith(it.isoCode.replace(/\s/g, '')))
    .sort((a, b) => b.isoCode.length - a.isoCode.length)[0]
  return category
}

// Mirrors buildIsoPath, but for the ISO 2022 category tree. Categories without a
// resolvable ancestor at a given level are simply left undefined - the row will
// then show empty cells for that level, which is expected while the 2016 -> 2022
// migration is still in progress.
export const buildIso22Path = (isoCode22: string, categories: IsoCategory22DTO[]): Iso22Path => {
  const normalizedCode = isoCode22.replace(/\s/g, '')
  const current =
    categories.find((it) => it.isoCode.replace(/\s/g, '') === normalizedCode) ??
    ({
      isoCode: normalizedCode,
      isoLevel: Math.min(4, Math.max(1, normalizedCode.length / 2)),
      isoTitle: '',
    } as IsoCategory22DTO)
  if (current.isoLevel === 1) return { level1: current }
  if (current.isoLevel === 2) {
    const level1 = getParentCategory22(current, categories, 1)
    return { level1, level2: current }
  }
  if (current.isoLevel === 3) {
    const level2 = getParentCategory22(current, categories, 2)
    const level1 = level2 ? getParentCategory22(level2, categories, 1) : undefined
    return { level1, level2, level3: current }
  }
  const level3 = getParentCategory22(current, categories, 3)
  const level2 = level3 ? getParentCategory22(level3, categories, 2) : undefined
  const level1 = level2 ? getParentCategory22(level2, categories, 1) : undefined
  return { level1, level2, level3, level4: current }
}
