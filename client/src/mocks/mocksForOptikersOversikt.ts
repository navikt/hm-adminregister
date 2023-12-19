import { RequestHandler, rest } from 'msw'
import { apiUrl } from '../http'
import { OversiktDetaljerResponse, OversiktResponse, SlettetAvType } from '../types'

const dateGenerator = (minusDays: number, dateTime: boolean): string => {
  var date = new Date()
  date.setDate(date.getDate() - minusDays)
  if (dateTime) return date.toISOString()
  let y = `${date.getFullYear()}`
  let m = (date.getMonth() < 10 ? '0' : '') + date.getMonth()
  let d = (date.getDate() < 10 ? '0' : '') + date.getDate()
  return `${y}-${m}-${d}`
}

const kravStore = [
  {
    id: 0,
    orgnavn: 'Brillehuset',
    orgnr: '123 456 789',
    barnsNavn: 'Sedat Kronjuvel',
    barnsFnr: '15084300133',
    barnsAlder: 12,
    høyreSfære: 1.25,
    høyreSylinder: -1.0,
    venstreSfære: 1.0,
    venstreSylinder: -1.0,
    bestillingsdato: dateGenerator(1, false),
    brillepris: 12345.0,
    beløp: 750.0,
    bestillingsreferanse: 'hlkefhuibv',
    satsNr: '3',
    satsBeløp: 750,
    satsBeskrivelse: 'Sfærisk styrke på minst ett glass ≥ 6,25 D ≤ 8,0 D og/eller cylinderstyrke ≥ 4,25 D ≤ 6,0 D.',
    opprettet: dateGenerator(0, true),
    slettet: undefined,
    slettetAvType: undefined,
  },
  {
    id: 1,
    orgnavn: 'Brillehuset',
    orgnr: '123 456 789',
    barnsNavn: 'Pippi Langstrømpe',
    barnsFnr: '15084300133',
    barnsAlder: 12,
    høyreSfære: 1.25,
    høyreSylinder: -1.0,
    venstreSfære: 1.0,
    venstreSylinder: -1.0,
    bestillingsdato: dateGenerator(1, false),
    brillepris: 12345.0,
    beløp: 750.0,
    bestillingsreferanse: 'hlkefhuibv',
    satsNr: '3',
    satsBeløp: 750,
    satsBeskrivelse: 'Sfærisk styrke på minst ett glass ≥ 6,25 D ≤ 8,0 D og/eller cylinderstyrke ≥ 4,25 D ≤ 6,0 D.',
    opprettet: dateGenerator(1, true),
    utbetalingsdato: undefined,
    slettet: dateGenerator(0, true),
    slettetAvType: SlettetAvType.INNSENDER,
  },
  {
    id: 2,
    orgnavn: 'Brillehuset',
    orgnr: '123 456 789',
    barnsNavn: 'Pippi Langstrømpe',
    barnsFnr: '15084300133',
    barnsAlder: 12,
    høyreSfære: 1.25,
    høyreSylinder: -1.0,
    venstreSfære: 1.0,
    venstreSylinder: -1.0,
    bestillingsdato: dateGenerator(1, false),
    brillepris: 12345.0,
    beløp: 750.0,
    bestillingsreferanse: 'hlkefhuibv',
    satsNr: '3',
    satsBeløp: 750,
    satsBeskrivelse: 'Sfærisk styrke på minst ett glass ≥ 6,25 D ≤ 8,0 D og/eller cylinderstyrke ≥ 4,25 D ≤ 6,0 D.',
    opprettet: dateGenerator(1, true),
    utbetalingsdato: dateGenerator(1, true),
    utbetalingsstatus: 'TIL_UTBETALING',
    slettet: dateGenerator(0, true),
    slettetAvType: SlettetAvType.NAV_ADMIN,
  },
  {
    id: 3,
    orgnavn: 'Brillehuset',
    orgnr: '123 456 789',
    barnsNavn: 'Pippi Langstrømpe',
    barnsFnr: '15084300133',
    barnsAlder: 12,
    høyreSfære: 1.25,
    høyreSylinder: -1.0,
    venstreSfære: 1.0,
    venstreSylinder: -1.0,
    bestillingsdato: dateGenerator(1, false),
    brillepris: 12345.0,
    beløp: 750.0,
    bestillingsreferanse: 'hlkefhuibv',
    satsNr: '3',
    satsBeløp: 750,
    satsBeskrivelse: 'Sfærisk styrke på minst ett glass ≥ 6,25 D ≤ 8,0 D og/eller cylinderstyrke ≥ 4,25 D ≤ 6,0 D.',
    opprettet: dateGenerator(2, true),
    utbetalingsdato: undefined,
    utbetalingsstatus: 'TIL_UTBETALING',
    slettet: undefined,
    slettetAvType: undefined,
  },
  ...[...Array(30).keys()].map((idx) => {
    return {
      id: 4 + idx,
      orgnavn: 'Brillehuset',
      orgnr: '123 456 789',
      barnsNavn: 'Harald Rustibus',
      barnsFnr: '15084300133',
      barnsAlder: 12,
      høyreSfære: 1.25,
      høyreSylinder: -1.0,
      venstreSfære: 1.0,
      venstreSylinder: -1.0,
      bestillingsdato: dateGenerator(7 + idx, false),
      brillepris: 12345.0,
      beløp: 750.0,
      bestillingsreferanse: 'hlkefhuibv',
      satsNr: '3',
      satsBeløp: 750,
      satsBeskrivelse: 'Sfærisk styrke på minst ett glass ≥ 6,25 D ≤ 8,0 D og/eller cylinderstyrke ≥ 4,25 D ≤ 6,0 D.',
      opprettet: dateGenerator(7 + idx, true),
      utbetalingsdato: dateGenerator(idx, true),
      utbetalingsstatus: idx === 0 ? 'TIL_UTBETALING' : 'UTBETALT',
      slettet: undefined,
      slettetAvType: undefined,
    }
  }),
]

export const handlers: RequestHandler[] = [
  rest.get<{}, {}, OversiktResponse>(apiUrl('/oversikt'), (req, res, ctx) => {
    let page = parseInt(req.url.searchParams.get('page') || '1')
    if (!page || isNaN(page)) page = 1
    let itemsPerPage = 10
    return res(
      ctx.delay(),
      ctx.status(200),
      ctx.json({
        numberOfPages: Math.ceil(kravStore.length / itemsPerPage),
        itemsPerPage: itemsPerPage,
        totalItems: kravStore.length,
        items: kravStore.slice(itemsPerPage * (page - 1), itemsPerPage * page),
      })
    )
  }),
  rest.get<{}, { vedtakId: string }, OversiktDetaljerResponse | {}>(apiUrl('/oversikt/:vedtakId'), (req, res, ctx) => {
    let idx = parseInt(req.params.vedtakId)
    let krav = kravStore[idx]
    if (krav) {
      return res(ctx.delay(), ctx.status(200), ctx.json(krav))
    }
    return res(ctx.delay(), ctx.status(404), ctx.json({}))
  }),
  rest.delete<{}, { vedtakId: string }, {}>(apiUrl('/krav/:vedtakId'), (req, res, ctx) => {
    let idx = parseInt(req.params.vedtakId)
    let krav = kravStore[idx]
    if (krav && !krav.slettet) {
      return res(ctx.delay(), ctx.status(200), ctx.json({}))
    }
    return res(ctx.delay(), ctx.status(400), ctx.json({}))
  }),
]
