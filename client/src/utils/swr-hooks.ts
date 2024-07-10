import {
  AdminUserChunk,
  AgreementsChunk,
  DelkontraktRegistrationDTO,
  IsoCategoryDTO,
  ProductRegistrationDTO,
  ProductVariantsForDelkontraktDto,
  ProdukterTilGodkjenningChunk,
  SeriesChunk,
  SeriesRegistrationDTO,
  SupplierChunk,
  SupplierRegistrationDTO,
  UserDTO,
} from "./types/response-types";
import { mapSuppliers } from "./supplier-util";
import { useErrorStore } from "./store/useErrorStore";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import useSWR, { Fetcher } from "swr";
import { HM_REGISTER_URL } from "environments";
import { LoggedInUser } from "./user-util";
import { AgreementFilterOption } from "rammeavtaler/Rammeavtaler";
import { getPath } from "api/fetch";

export function baseUrl(url: string = "") {
  if (process.env.NODE_ENV === "production") {
    return `/adminregister${url}`;
  } else {
    return url;
  }
}

export class CustomError extends Error {
  status: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "CustomError";
    this.status = statusCode;
  }
}

export const fetcherGET: Fetcher<any, string> = (url) =>
  fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status);
      });
    }
    return res.json();
  });

export function useSeries(seriesUUID: string) {
  const { loggedInUser } = useAuthStore();

  const seriesIdPath = getPath(loggedInUser?.isAdmin || false, `/api/v1/series/${seriesUUID}`);

  const {
    data: series,
    error: errorSeries,
    isLoading: isLoadingSeries,
    mutate: mutateSeries,
  } = useSWR<SeriesRegistrationDTO>(loggedInUser ? seriesIdPath : null, fetcherGET);

  return {
    series,
    isLoadingSeries,
    errorSeries,
    mutateSeries,
  };
}

export function useSeriesByHmsNr(hmsNr: string) {
  const { loggedInUser } = useAuthStore();

  const seriesIdPath = getPath(loggedInUser?.isAdmin || false, `/api/v1/series/hmsNr/${hmsNr}`);

  const {
    data: seriesByHmsNr,
    error: errorSeriesByHmsNr,
    isLoading: isLoadingSeriesByHmsNr,
  } = useSWR<SeriesRegistrationDTO>(loggedInUser?.isAdmin && hmsNr.length > 0 ? seriesIdPath : null, fetcherGET);

  return {
    seriesByHmsNr,
    errorSeriesByHmsNr,
    isLoadingSeriesByHmsNr,
  };
}

export function useSeriesBySupplierRef(supplierRef: string) {
  const { loggedInUser } = useAuthStore();

  const seriesIdPath = getPath(loggedInUser?.isAdmin || false, `/api/v1/series/supplierRef/${supplierRef}`);

  const {
    data: seriesBySupplierRef,
    error: errorSeriesBySupplierRef,
    isLoading: isLoadingSeriesBySupplierRef,
  } = useSWR<SeriesRegistrationDTO>(loggedInUser?.isAdmin && supplierRef.length > 0 ? seriesIdPath : null, fetcherGET);

  return {
    seriesBySupplierRef,
    errorSeriesBySupplierRef,
    isLoadingSeriesBySupplierRef,
  };
}

export function userProductVariantsBySeriesId(seriesId: string) {
  const { loggedInUser } = useAuthStore();
  const seriesIdPath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/${seriesId}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/series/${seriesId}`;

  const {
    data: variants,
    error: errorVariants,
    isLoading: isLoadingVariants,
    mutate: mutateVariants,
  } = useSWR<ProductRegistrationDTO[]>(loggedInUser ? seriesIdPath : null, fetcherGET);

  return {
    variants,
    isLoadingVariants,
    errorVariants,
    mutateVariants,
  };
}

export function useProducts({ titleSearchTerm, statusFilters }: { titleSearchTerm: string; statusFilters: string[] }) {
  const { loggedInUser } = useAuthStore();

  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : "";

  const status = statusFilters && statusFilters.includes("includeInactive") ? "ACTIVE,INACTIVE" : "ACTIVE";

  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/series?excludedStatus=DELETED${titleSearchParam}&status=${status}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/series?excludedStatus=DELETED${titleSearchParam}&status=${status}`;

  const { data, error, isLoading } = useSWR<SeriesChunk>(
    titleSearchTerm && titleSearchParam !== "" ? path : null,
    fetcherGET,
  );

  return {
    data,
    isLoading,
    error,
  };
}

export function usePagedProducts({
  page,
  pageSize,
  statusFilters,
}: {
  page: number;
  pageSize: number;
  statusFilters: string[];
}) {
  const { loggedInUser } = useAuthStore();

  const status = statusFilters && statusFilters.includes("includeInactive") ? "ACTIVE,INACTIVE" : "ACTIVE";

  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/series?page=${page}&size=${pageSize}&status=${status}&sort=created,DESC&excludedStatus=DELETED`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/series?page=${page}&size=${pageSize}&status=${status}&sort=created,DESC&excludedStatus=DELETED`;

  const { data, error, isLoading } = useSWR<SeriesChunk>(path, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

export function useSeriesToApprove() {
  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/to-approve`;

  const { data, error, isLoading } = useSWR<ProdukterTilGodkjenningChunk>(loggedInUser ? path : null, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

export function usePagedSeriesToApprove({ page, pageSize }: { page: number; pageSize: number }) {
  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/to-approve?page=${page}&size=${pageSize}&sort=created,desc`;

  const { data, error, isLoading } = useSWR<ProdukterTilGodkjenningChunk>(loggedInUser ? path : null, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

export function usePagedAgreements({
  page,
  pageSize,
  filter,
}: {
  page: number;
  pageSize: number;
  filter: AgreementFilterOption;
}) {
  const { loggedInUser } = useAuthStore();

  let queryParamFilter = "";
  if (filter !== AgreementFilterOption.ALL) {
    queryParamFilter = `&filter=${filter}`;
  }

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations?page=${page}&size=${pageSize}&excludedAgreementStatus=DELETED${queryParamFilter}`;

  const { data, error, isLoading } = useSWR<AgreementsChunk>(loggedInUser ? path : null, fetcherGET);

  return {
    data,
    isLoading,
    error,
  };
}

export function useDelkontrakterByAgreementId(agreementId: string) {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/agreement/${agreementId}`;

  const { data, error, isLoading, mutate } = useSWR<DelkontraktRegistrationDTO[]>(path, fetcherGET);

  useEffect(() => {
    if (error) {
      setGlobalError(error.status, error.message);
    }
  }, [error, setGlobalError]);

  return {
    data,
    isLoading,
    error,
    mutate,
  };
}

export function useProductAgreementsByDelkontraktId(delkontraktId?: string) {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/variants/delkontrakt/${delkontraktId}`;

  const { data, error, isLoading, mutate } = useSWR<ProductVariantsForDelkontraktDto[]>(
    delkontraktId ? path : null,
    fetcherGET,
  );

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    data,
    isLoading,
    mutateProductAgreements: mutate,
    error,
  };
}

export function useProductByProductId(productId: string) {
  const { loggedInUser } = useAuthStore();
  const path = getPath(loggedInUser?.isAdmin || false, `/api/v1/product/registrations/${productId}`);

  const { data: product, error, isLoading, mutate } = useSWR<ProductRegistrationDTO>(path, fetcherGET);

  return {
    product,
    isLoading,
    error,
    mutate,
  };
}

export function useProductVariantsBySeriesId(seriesId?: string) {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/${seriesId}`;

  const { data, error, isLoading } = useSWR<ProductRegistrationDTO[]>(seriesId ? path : null, fetcherGET);

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    data,
    isLoading,
    error,
  };
}

export function useAgreements() {
  const { setGlobalError } = useErrorStore();
  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations?excludedAgreementStatus=DELETED`;

  const { data, error, isLoading } = useSWR<AgreementsChunk>(loggedInUser ? path : null, fetcherGET);

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    data,
    isLoading,
    error,
  };
}

export function useUser(loggedInUser: LoggedInUser | undefined) {
  const { setGlobalError } = useErrorStore();
  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/users/`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/users/`;

  const { data, error, isLoading, mutate } = useSWR<UserDTO>(
    loggedInUser ? path + loggedInUser?.userId : null,
    fetcherGET,
    {
      shouldRetryOnError: false,
    },
  );

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    user: data,
    userError: error,
    userIsLoading: isLoading,
    mutateUser: mutate,
  };
}

export function useSupplier(isAdmin: boolean | undefined, id?: string) {
  const { setGlobalError } = useErrorStore();
  const path = isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations/${id}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/supplier/registrations`;
  const shouldFetch = (isAdmin && id) || isAdmin === false;
  const { data, error, isLoading, mutate } = useSWR<SupplierRegistrationDTO>(shouldFetch ? path : null, fetcherGET, {
    shouldRetryOnError: false,
    revalidateOnMount: true,
  });

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    supplier: data,
    supplierError: error,
    supplierIsLoading: isLoading,
    supplierMutate: mutate,
  };
}

export function useSuppliers() {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations`;
  const { data, error, isLoading } = useSWR<SupplierChunk>(path, fetcherGET);
  const suppliers = data && mapSuppliers(data);

  return {
    suppliers,
    isLoading,
    error,
  };
}

export function useIsoCategories() {
  const path = `${HM_REGISTER_URL()}/admreg/api/v1/isocategories`;
  const { data, error, isLoading } = useSWR<IsoCategoryDTO[]>(path, fetcherGET);
  const isoCategories = data && data;

  return {
    isoCategories,
    isoLoading: isLoading,
    isoError: error,
  };
}

export function useAdminUsers() {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/users/`;
  const { data, error, isLoading } = useSWR<AdminUserChunk>(path, fetcherGET);
  const adminUsers: UserDTO[] | undefined = data && data.content;

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    adminUsers,
    isLoading,
    error,
  };
}
