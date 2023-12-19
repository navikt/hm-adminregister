import { fnr } from '@navikt/fnrvalidator'
import { isAfter, isBefore, isSameDay, isValid, subMonths } from 'date-fns'
import { dato } from './dato'

export const DATO_FOR_LANSERING = new Date('Aug 1 2022')

export const validering = {
  fnr(verdi: string): boolean {
    return fnr(verdi).status === 'valid'
  },
  dato(verdi: string): boolean {
    return isValid(dato.tilDate(verdi))
  },
  beløp(verdi: string): boolean {
    return /^\d+(,\d{1,2})?$/.test(verdi)
  },
  ikkeIFremtiden(verdi: Date, nå: Date): boolean {
    return isBefore(verdi, nå)
  },
  ikkeDatoFørLansering(verdi: Date): boolean {
    if (isSameDay(DATO_FOR_LANSERING, verdi)) {
      return true
    }
    return isBefore(DATO_FOR_LANSERING, verdi)
  },
  ikkeMerEnnSeksMånederSiden(verdi: Date, nå: Date): boolean {
    const seksMånederSiden = subMonths(nå, 6)
    return isAfter(verdi, seksMånederSiden)
  },
  bestillingsreferanse(verdi: string): boolean {
    return /^[A-Za-å\d-_/]+$/.test(verdi) && verdi.length <= 100
  },
}

export function validator(test: (verdi: string, nå: Date) => boolean, error: string): (verdi: string) => true | string {
  return (verdi) => {
    return test(verdi, new Date()) || error
  }
}
