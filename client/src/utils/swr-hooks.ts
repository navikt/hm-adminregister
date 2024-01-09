import {
  AdminUserChunk, AgreementsChunk,
  IsoCategoryDTO,
  MediaDTO,
  SeriesChunk,
  SupplierChunk,
  SupplierRegistrationDTO,
  UserDTO,
} from './response-types'
import { LoggedInUser } from './user-util'
import { mapSuppliers } from './supplier-util'
import { useHydratedErrorStore } from './store/useErrorStore'
import { useEffect } from 'react'
import { useHydratedAuthStore } from './store/useAuthStore'
import useSWR, { Fetcher } from 'swr'
import { HM_REGISTER_URL } from '../environments'


export function baseUrl(url: string = '') {
  if (process.env.NODE_ENV === 'production') {
    return `/adminregister-vite${url}`
  } else {
    return url
  }
}

export function apiUrl(url: string) {
  return baseUrl(`/api${url}`)
}

export class CustomError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'CustomError'
    this.statusCode = statusCode
  }
}

export const fetcherMultipleUrls: Fetcher<any[], string[]> = (urls: string[]) => {
  const f = (url: string) => fetch(url).then((r) => r.json())
  return Promise.all(urls.map((url) => f(url)))
}

//Ikke i bruk enda, men skal brukes til å hente flere urls
// const {
//   data: media,
//   error: mediaError,
//   isLoading: mediaIsLoading,
// } = useSWR<MediaDTO[]>(urlsMaybe && urlsMaybe.length > 0 ? urlsMaybe : null, fetcherMultipleUrls)
// console.log('media?', urlsMaybe, media)

export const fetcherGET: Fetcher<any, string> = (url) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status)
      })
    }
    return res.json()
  })

export function useProducts() {
  const { setGlobalError } = useHydratedErrorStore()

  const { loggedInUser } = useHydratedAuthStore()

  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/product/registrations/series/group`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/product/registrations/series/group`

  const { data, error, isLoading } = useSWR<SeriesChunk>(loggedInUser ? path : null, fetcherGET)

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    data,
    isLoading,
    error,
  }
}

export function useAgreements({ page, pageSize }: { page: number, pageSize: number }) {
  const { setGlobalError } = useHydratedErrorStore()
  const { loggedInUser } = useHydratedAuthStore()

  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/agreement/registrations?page=${page}&size=${pageSize}`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/agreement/registrations?page=${page}&size=${pageSize}`

  const { data, error, isLoading } = useSWR<AgreementsChunk>(loggedInUser ? path : null, fetcherGET)

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    data,
    isLoading,
    error,
  }
}

export function useUser(loggedInUser?: LoggedInUser) {
  const { setGlobalError } = useHydratedErrorStore()
  const path = loggedInUser?.isAdmin ? `${HM_REGISTER_URL}/admreg/admin/api/v1/users/` : `${HM_REGISTER_URL}/admreg/vendor/api/v1/users/`
  const { data, error, isLoading } = useSWR<UserDTO>(loggedInUser ? path + loggedInUser?.userId : null, fetcherGET)

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    user: data,
    userError: error,
    userIsLoading: isLoading,
  }
}

export function useSupplier(isAdmin: boolean | undefined, id?: string) {
  const { setGlobalError } = useHydratedErrorStore()
  const path = isAdmin
    ? `${HM_REGISTER_URL}/admreg/admin/api/v1/supplier/registrations/${id}`
    : `${HM_REGISTER_URL}/admreg/vendor/api/v1/supplier/registrations`
  const shouldFetch = (isAdmin && id) || isAdmin === false
  const { data, error, isLoading, mutate } = useSWR<SupplierRegistrationDTO>(shouldFetch ? path : null, fetcherGET, {
    shouldRetryOnError: false,
    revalidateOnMount: true,
  })

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    supplier: data,
    supplierError: error,
    supplierIsLoading: isLoading,
    supplierMutate: mutate,
  }
}

export function useSuppliers() {
  const { setGlobalError } = useHydratedErrorStore()

  const path = `${HM_REGISTER_URL}/admreg/admin/api/v1/supplier/registrations`
  const { data, error, isLoading } = useSWR<SupplierChunk>(path, fetcherGET)
  const suppliers = data && mapSuppliers(data)

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    suppliers,
    isLoading,
    error,
  }
}

export function useIsoCategories() {
  const path = `${HM_REGISTER_URL}/admreg/api/v1/isocategories`
  const { data, error, isLoading } = useSWR<IsoCategoryDTO[]>(path, fetcherGET)
  const isoCategories = data && data

  return {
    isoCategories,
    isoLoading: isLoading,
    isoError: error,
  }
}

export function useImagesConnectedToOID(oid: string, isAdmin?: boolean) {
  const mediaUrl = isAdmin ? `${HM_REGISTER_URL}/admreg/admin/api/v1/media/${oid}` : `${HM_REGISTER_URL}/admreg/vendor/api/v1/media/${oid}`

  const { data, error, isLoading, mutate } = useSWR<MediaDTO[]>(mediaUrl, fetcherGET)

  const imagesConnectedToOID: MediaDTO[] | undefined =
    data && data.filter((file) => file.type === 'IMAGE' && file.status !== 'DELETED')

  return {
    imagesConnectedToOID,
    isLoading,
    error,
    mutate,
  }
}

export function useDocumentsConnectedToOID(isAdmin: boolean | undefined, oid: string) {
  const mediaUrl = isAdmin ? `${HM_REGISTER_URL}/admreg/vendor/api/v1/media/${oid}` : `${HM_REGISTER_URL}/admreg/vendor/api/v1/media/${oid}`

  const { data: files, error, isLoading, mutate } = useSWR<MediaDTO[]>(mediaUrl, fetcherGET)

  const pdfs = files && files.filter((file) => file.type === 'PDF')

  return {
    pdfs,
    isLoading,
    error,
  }
}

export function useAdminUsers() {
  const { setGlobalError } = useHydratedErrorStore()

  const path = `${HM_REGISTER_URL}/admreg/admin/api/v1/users/`
  const { data, error, isLoading } = useSWR<AdminUserChunk>(path, fetcherGET)
  const adminUsers: UserDTO[] | undefined = data && data.content

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message)
    }
  }, [error, setGlobalError])

  return {
    adminUsers,
    isLoading,
    error,
  }
}
