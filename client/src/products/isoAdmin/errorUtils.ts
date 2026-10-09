// fetchAPI avviser med et vanlig objekt ({ message, status, errorDetail }), ikke en Error-instans.
// Backend legger den konkrete feilteksten i errorDetail (Micronaut _embedded.errors[0].message),
// mens message ofte bare er HTTP-statusteksten (f.eks. "Bad Request").
export const extractErrorMessage = (error: unknown, fallback = 'Noe gikk galt. Prøv igjen.'): string => {
  if (typeof error !== 'object' || error === null) return fallback
  if ('errorDetail' in error && typeof error.errorDetail === 'string' && error.errorDetail) {
    return error.errorDetail
  }
  if ('message' in error && typeof error.message === 'string' && error.message) {
    return error.message
  }
  return fallback
}
