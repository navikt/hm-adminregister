import { format, parseISO } from "date-fns";

export const toDateTimeString = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
};

export const toReadableString = (date: string): string => {
  return format(parseISO(date), "dd.MM.yyyy");
};

export const toReadableDateTimeString = (date: string): string => {
  return format(parseISO(date), "dd.MM.yyyy', kl. 'HH:mm");
};

export const toReadableDateString = (date: string): string => {
  return format(parseISO(date), "dd.MM.yyyy");
};

export const toDate = (date: string): Date => {
  return parseISO(date);
};

export const todayTimestamp = (): string => {
  return toDateTimeString(new Date());
};
