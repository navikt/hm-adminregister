import { activeAgreementsSortedByRank, widenRowsWithAgreementSlots } from 'utils/export/agreementSlots'
import { expect, test } from 'vitest'

const agreement = (status: string, rank: number) => ({
  status,
  rank,
  postNr: rank,
  postTitle: `Post ${rank}`,
  reference: `ref-${rank}`,
  title: `Avtale ${rank}`,
})

test('beholder bare aktive avtaler, sortert etter rangering', () => {
  const result = activeAgreementsSortedByRank([
    agreement('ACTIVE', 3),
    agreement('INACTIVE', 1),
    agreement('ACTIVE', 2),
  ])
  expect(result.map((a) => a.rank)).toEqual([2, 3])
})

test('gir alle rader like mange avtalekolonner og fyller ubrukte plasser med tomme verdier', () => {
  const rows = widenRowsWithAgreementSlots([
    { base: { navn: 'a' }, activeAgreements: [agreement('ACTIVE', 1), agreement('ACTIVE', 2)] },
    { base: { navn: 'b' }, activeAgreements: [] },
  ])
  expect(rows[0]).toMatchObject({ navn: 'a', 'Rangering 1': 1, 'Delkontrakt 2': 'Post 2', 'Anbudsnr 2': 'ref-2' })
  expect(rows[1]).toMatchObject({ navn: 'b', 'Rangering 1': '', 'Avtaletittel 2': '' })
  expect(Object.keys(rows[0])).not.toContain('Rangering 3')
})
