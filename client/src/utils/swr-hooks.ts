import { useEffect } from "react";
import useSWR, { Fetcher } from "swr";

import { AgreementFilterOption } from "agreements/Agreements";
import { getPath } from "api/fetch";
import { CreatedByFilter } from "approval/ForApproval";
import { HM_REGISTER_URL } from "environments";
import { useAuthStore } from "./store/useAuthStore";
import { useErrorStore } from "./store/useErrorStore";
import { mapSuppliers } from "./supplier-util";
import {
  AdminUserChunk,
  AgreementsChunk,
  DelkontraktRegistrationDTO,
  IsoCategoryDTO,
  ProductRegistrationDTO,
  ProductRegistrationDTOV2,
  ProductVariantsForDelkontraktDto,
  ProdukterTilGodkjenningChunk,
  SeriesChunk,
  SeriesRegistrationDTO,
  SeriesSearchChunk,
  SeriesSearchDTO,
  SupplierChunk,
  SupplierRegistrationDTO,
  UserDTO,
} from "./types/response-types";
import { LoggedInUser } from "./user-util";

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

export function useSeriesByVariantIdentifier(variantIdentifier: string) {
  const seriesIdPath = `${HM_REGISTER_URL()}/admreg/api/v1/series/variant-id/${variantIdentifier}`;

  return useSWR<SeriesSearchDTO>(variantIdentifier.length > 0 ? seriesIdPath : null, fetcherGET);
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
  } = useSWR<ProductRegistrationDTOV2[]>(loggedInUser ? seriesIdPath : null, fetcherGET);

  return {
    variants,
    isLoadingVariants,
    errorVariants,
    mutateVariants,
  };
}

export function usePagedProducts({
  page,
  pageSize,
  titleSearchTerm,
  filters,
  supplierFilter,
}: {
  page: number;
  pageSize: number;
  titleSearchTerm: string;
  filters: string[];
  supplierFilter?: string;
}) {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : "";

  const filterUrl = statusFilterProductsURL(filters);

  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : "";

  const mainProductParam: string = `&mainProduct=true`;

  const path = `${HM_REGISTER_URL()}/admreg/api/v1/series?page=${page}&size=${pageSize}&sort=created,DESC&${filterUrl.toString()}&excludedStatus=DELETED${titleSearchParam}${supplierParam}${mainProductParam}`;

  return useSWR<SeriesSearchChunk>(path, fetcherGET);
}

const statusFilterProductsURL = (statusFilters: string[]) => {
  // const editStatus = ["EDITABLE", "PENDING_APPROVAL", "REJECTED", "DONE"];
  // const otherStatuses = ["includeInactive", "onlyUnpublished"];
  const editStatus: string[] = [];
  let excludeExpired = true;

  const visningStatusfilter = ["Under endring", "Venter på godkjenning", "Avslått", "Publisert", "Ikke publisert"];

  const uri = new URLSearchParams();

  statusFilters.forEach((status) => {
    if (status === "Under endring") {
      editStatus.push("EDITABLE");
    } else if (status === "Venter på godkjenning") {
      editStatus.push("PENDING_APPROVAL");
    } else if (status === "Avslått") {
      editStatus.push("REJECTED");
    } else if (status === "Publisert") {
      editStatus.push("DONE");
      // } else if (status === "Ikke publisert") {
      //   otherStatuses.push("unpublished");
    } else if (status === "Vis utgåtte") {
      excludeExpired = false;
    }
  });

  excludeExpired && uri.append("excludeExpired", "true");

  if (editStatus.length > 0) {
    uri.append("editStatus", editStatus.join(","));
  }

  return uri;
};

export function getAllRejectedSeries() {
  const path = `${HM_REGISTER_URL()}/admreg/vendor/api/v1/series?size=1000000&adminStatus=REJECTED`;

  const { data } = useSWR<SeriesChunk>(path, fetcherGET);

  return data;
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

// TODO: Slå sammen med usePagedProducts
export function usePagedProductsToApprove({
  page,
  pageSize,
  createdByFilter,
  supplierFilter,
  titleSearchTerm,
  sortUrl,
}: {
  page: number;
  pageSize: number;
  createdByFilter: CreatedByFilter;
  supplierFilter?: string;
  titleSearchTerm?: string;
  sortUrl: string | null;
}) {
  const { loggedInUser } = useAuthStore();

  const basePath = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/series?page=${page}&size=${pageSize}`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/series?page=${page}&size=${pageSize}`;

  const filterUrl = new URLSearchParams();

  filterUrl.append("editStatus", "PENDING_APPROVAL");
  supplierFilter ? filterUrl.append("supplierFilter", supplierFilter) : "";
  titleSearchTerm ? filterUrl.append("title", titleSearchTerm) : "";

  const sortBy = sortUrl?.split(",")[0] || "updated";
  const sortDirection = sortUrl?.split(",")[1] || "descending";
  const sortURL =
    sortUrl && sortDirection !== "none" ? `sort=${sortBy},${sortDirection === "descending" ? "DESC" : "ASC"}&` : "";
  if (createdByFilter === CreatedByFilter.ADMIN) {
    filterUrl.append("createdByAdmin", "true");
  } else if (createdByFilter === CreatedByFilter.SUPPLIER) {
    filterUrl.append("createdByAdmin", "false");
  }

  const path = loggedInUser?.isAdmin
    ? `${basePath}&${sortURL}${filterUrl.toString()}&excludedStatus=DELETED`
    : `${basePath}&${filterUrl.toString()}&excludedStatus=DELETED`;

  const { data, error, isLoading, mutate } = useSWR<SeriesChunk>(loggedInUser ? path : null, fetcherGET);

  return {
    data,
    isLoading,
    mutate,
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
    fetcherGET
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

  const { data: product, error, isLoading, mutate } = useSWR<ProductRegistrationDTOV2>(path, fetcherGET);

  return {
    product,
    isLoading,
    error,
    mutate,
  };
}

export function useProductVariantsBySeriesId(seriesId?: string) {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/old/series/${seriesId}`;

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
  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations?excludedAgreementStatus=DELETED`;

  const { data, error, isLoading } = useSWR<AgreementsChunk>(loggedInUser ? path : null, fetcherGET);

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
    }
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

export function useSuppliers(isAdmin: boolean) {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations?sort=name`;
  const { data, error, isLoading } = useSWR<SupplierChunk>(isAdmin ? path : null, fetcherGET);
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
