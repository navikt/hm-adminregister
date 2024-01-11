import { format, parseISO } from 'date-fns'

export const toDateTimeString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS')
}

export const toReadableString = (date: string): string => {
  return format(parseISO(date), 'MM.dd.yyyy')
}

export const toReadableDateTimeString = (date: string): string => {
  return format(parseISO(date), "MM.dd.yyyy' , kl. 'HH:mm")
}

export const toDate = (date: string): Date => {
  return parseISO(date)
}