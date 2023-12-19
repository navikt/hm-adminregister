import { HttpError } from './error'
import type { Resultat } from './types'

export function baseUrl(url: string = '') {
  if (process.env.NODE_ENV === 'production') {
    return `/hjelpemidler/barnebriller${url}`
  } else {
    return url
  }
}

export function apiUrl(url: string) {
  return baseUrl(`/api${url}`)
}

export const http = {
  async get<T>(path: string): Promise<T> {
    try {
      const url = apiUrl(path)
      const response = await fetch(url, {
        method: 'get',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      })
      if (response.ok) {
        return response.json()
      }
      return Promise.reject(HttpError.kallFeilet(url, response))
    } catch (err: unknown) {
      return Promise.reject(HttpError.wrap(err))
    }
  },
  async post<B, T>(path: string, body: B): Promise<Resultat<T>> {
    try {
      const url = apiUrl(path)
      const response = await fetch(url, {
        method: 'post',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        return { data }
      }
      return {
        error: HttpError.kallFeilet(url, response),
      }
    } catch (err: unknown) {
      return {
        error: HttpError.wrap(err),
      }
    }
  },
  async delete<B, T>(path: string, body: B): Promise<Resultat<T>> {
    try {
      const url = apiUrl(path)
      const response = await fetch(url, {
        method: 'delete',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        const data = await response.json()
        return { data }
      }
      return {
        error: HttpError.kallFeilet(url, response),
      }
    } catch (err: unknown) {
      return {
        error: HttpError.wrap(err),
      }
    }
  },
}
