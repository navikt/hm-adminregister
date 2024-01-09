import { format } from 'date-fns'

export const toDateTimeString = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS")
}