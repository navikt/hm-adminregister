export function organisasjonsnummer(verdi?: string) {
  if (!verdi) {
    return null
  }
  if (verdi.length !== 9) {
    return verdi
  }
  return verdi.slice(0, 3) + ' ' + verdi.slice(3, 6) + ' ' + verdi.slice(6)
}
