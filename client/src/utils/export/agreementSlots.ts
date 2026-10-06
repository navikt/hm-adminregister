export type ExportAgreement = {
  status: string
  rank: number
  postNr?: number | null
  postTitle?: string | null
  reference?: string | null
  title?: string | null
}

export type RowWithAgreements<A extends ExportAgreement = ExportAgreement> = {
  base: Record<string, unknown>
  activeAgreements: A[]
}

export const activeAgreementsSortedByRank = <A extends ExportAgreement>(agreements: A[] | null | undefined): A[] =>
  (agreements ?? []).filter((agreement) => agreement.status === 'ACTIVE').sort((a, b) => a.rank - b.rank)

// Widens rows with one column set per agreement "slot" (1-indexed), e.g. "Rangering 1", "Delkontrakt 1", ...
// up to the highest number of active agreements on any row in the batch. Rows with fewer agreements get
// blank values in the unused higher slots.
export const widenRowsWithAgreementSlots = (rows: RowWithAgreements[]): Record<string, unknown>[] => {
  const maxAgreementCount = rows.reduce((max, row) => Math.max(max, row.activeAgreements.length), 0)
  return rows.map(({ base, activeAgreements }) => {
    const row: Record<string, unknown> = { ...base }
    for (let slot = 1; slot <= maxAgreementCount; slot++) {
      const agreement = activeAgreements[slot - 1]
      row[`Rangering ${slot}`] = agreement?.rank ?? ''
      row[`Delkontrakt ${slot}`] = agreement?.postTitle ?? ''
      row[`Delkontraktnr ${slot}`] = agreement?.postNr ?? ''
      row[`Anbudsnr ${slot}`] = agreement?.reference ?? ''
      row[`Avtaletittel ${slot}`] = agreement?.title ?? ''
    }
    return row
  })
}
