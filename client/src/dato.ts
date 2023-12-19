import { formatISO, isMatch, parse } from 'date-fns'

const formatter = new Intl.DateTimeFormat('nb', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const formatterLong = new Intl.DateTimeFormat('nb', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

function formater(verdi?: Date | number | string, formatLong?: boolean): string {
  if (formatLong === true) return verdi ? formatterLong.format(new Date(verdi)) : ''
  return verdi ? formatter.format(new Date(verdi)) : ''
}

function tilDate(verdi: string): Date {
  if (isMatch(verdi, 'ddMMyyyy')) {
    return parse(verdi, 'ddMMyyyy', new Date())
  }
  return parse(verdi, 'dd.MM.yyyy', new Date())
}

function tilISO(verdi: Date): string {
  return !verdi ? verdi : formatISO(verdi, { representation: 'date' })
}

function nå(): string {
  return formater(Date.now())
}

export const dato = {
  formater,
  tilDate,
  tilISO,
  nå,
}
