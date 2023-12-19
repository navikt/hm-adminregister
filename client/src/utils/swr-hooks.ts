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
    ? `/admreg/admin/api/v1/product/registrations/series/group`
    : `/admreg/vendor/api/v1/product/registrations/series/group`

  const { data, error, isLoading } = useSWR<SeriesChunk>(path, fetcherGET)

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
    ? `/admreg/admin/api/v1/agreement/registrations?page=${page}&size=${pageSize}`
    : `/admreg/vendor/api/v1/agreement/registrations?page=${page}&size=${pageSize}`

  const { data, error, isLoading } = useSWR<AgreementsChunk>(path, fetcherGET)

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
  const path = loggedInUser?.isAdmin ? '/admreg/admin/api/v1/users/' : '/admreg/vendor/api/v1/users/'
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
    ? `/admreg/admin/api/v1/supplier/registrations/${id}`
    : '/admreg/vendor/api/v1/supplier/registrations'
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

  const path = '/admreg/admin/api/v1/supplier/registrations'
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
  const path = '/admreg/api/v1/isocategories'
  const { data, error, isLoading } = useSWR<IsoCategoryDTO[]>(path, fetcherGET)
  const isoCategories = data && data

  return {
    isoCategories,
    isoLoading: isLoading,
    isoError: error,
  }
}

export function useImagesConnectedToOID(oid: string, isAdmin?: boolean) {
  const mediaUrl = isAdmin ? `/admreg/admin/api/v1/media/${oid}` : `/admreg/vendor/api/v1/media/${oid}`

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
  const mediaUrl = isAdmin ? `/admreg/vendor/api/v1/media/${oid}` : `/admreg/vendor/api/v1/media/${oid}`

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

  const path = '/admreg/admin/api/v1/users/'
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
