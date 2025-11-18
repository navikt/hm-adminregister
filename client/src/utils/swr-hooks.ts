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
  SeriesSearchChunk,
  SeriesSearchDTO,
  SupplierChunk,
  SupplierRegistrationDTO,
  UserDTO,
  ProductChunk,
} from "./types/response-types";
import { LoggedInUser } from "./user-util";

export function baseUrl(url: string = "") {
  if (process.env.NODE_ENV === "production") {
    return `/adminregister${url}`;
  } else {
    return url;
  }
}

class CustomError extends Error {
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

export function useSeriesByVariantIdentifier(variantIdentifier: string) {
  const encodedVariantId = encodeURIComponent(variantIdentifier);
  const seriesIdPath = `${HM_REGISTER_URL()}/admreg/api/v1/series/variant-id/${encodedVariantId}`;

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

export function usePagedSeriesToApprove({
  page,
  pageSize,
  createdByFilter,
  supplierFilter,
  titleSearchTerm,
  sortUrl,
  filters,
}: {
  page: number;
  pageSize: number;
  createdByFilter: CreatedByFilter;
  supplierFilter?: string;
  titleSearchTerm?: string;
  sortUrl: string | null;
  filters: string[];
}) {
  const basePath = `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/to-approve?page=${page}&size=${pageSize}`;

  const filterUrl = new URLSearchParams();

  supplierFilter ? filterUrl.append("supplierFilter", supplierFilter) : "";
  titleSearchTerm ? filterUrl.append("title", titleSearchTerm) : "";

  if (!(filters.includes("Endring") && filters.includes("Nytt produkt"))) {
    if (filters.includes("Endring")) {
      filterUrl.append("isPublished", "true");
    } else if (filters.includes("Nytt produkt")) {
      filterUrl.append("isPublished", "false");
    }
  }

  if (!(filters.includes("Hovedprodukt") && filters.includes("Tilbehør/Del"))) {
    if (filters.includes("Hovedprodukt")) {
      filterUrl.append("mainProduct", "true");
    } else if (filters.includes("Tilbehør/Del")) {
      filterUrl.append("mainProduct", "false");
    }
  }
  if (createdByFilter === CreatedByFilter.ADMIN) {
    filterUrl.append("createdByAdmin", "true");
  } else if (createdByFilter === CreatedByFilter.SUPPLIER) {
    filterUrl.append("createdByAdmin", "false");
  }

  const sortBy = sortUrl?.split(",")[0] || "updated";
  const sortDirection = sortUrl?.split(",")[1] || "descending";
  const sortURL =
    sortUrl && sortDirection !== "none" ? `sort=${sortBy},${sortDirection === "descending" ? "DESC" : "ASC"}&` : "";

  const path = `${basePath}&${sortURL}${filterUrl.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<ProdukterTilGodkjenningChunk>(path, fetcherGET);

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

export function useProductAgreementsByDelkontraktId(delkontraktId: string, mainProductsOnly: boolean) {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product-agreement/variants/delkontrakt/${delkontraktId}?mainProductsOnly=${mainProductsOnly}`;

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
    : loggedInUser?.isHmsUser
      ? `${HM_REGISTER_URL()}/admreg/hms-user/api/v1/users/`
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
  const users: UserDTO[] | undefined = data && data.content;
  const adminUsers = users && users.filter((user) => user.roles.includes("ROLE_ADMIN"));

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

export function useHmsUsers() {
  const { setGlobalError } = useErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/users/`;
  const { data, error, isLoading } = useSWR<AdminUserChunk>(path, fetcherGET);
  const users: UserDTO[] | undefined = data && data.content;
  const hmsUsers = users && users.filter((user) => user.roles.includes("ROLE_HMS"));

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

  return {
    hmsUsers,
    isLoading,
    error,
  };
}

export function usePagedProductsForTechnician({
  page,
  pageSize,
  titleSearchTerm,
  supplierFilter
}: {
  page: number;
  pageSize: number;
  titleSearchTerm: string;
  supplierFilter?: string;
}) {
  const titleSearchParam = titleSearchTerm ? `&title=${titleSearchTerm}` : "";
  const supplierParam = supplierFilter ? `&supplierId=${encodeURIComponent(supplierFilter)}` : "";


  const mainProductParam: string = `&mainProduct=true`;

  const path = `${HM_REGISTER_URL()}/admreg/api/v1/series?page=${page}&size=${pageSize}&sort=created,DESC&excludedStatus=DELETED${titleSearchParam}${mainProductParam}${supplierParam}`;

  return useSWR<SeriesSearchChunk>(path, fetcherGET);
}

export function useCountSeriesToApprove() {
  // Fetch first page with size=1 to derive total count from totalPages when size=1
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/series/to-approve?page=0&size=1`;
  const { data, error, isLoading } = useSWR<ProdukterTilGodkjenningChunk>(path, fetcherGET);
  const count = data?.totalPages === undefined ? undefined : data.totalPages; // since size=1
  return { count, error, isLoading };
}

export function usePartsMissingHmsArtNr(maxPageSize: number = 500) {
  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/part/missing-hmsartnr/supplier-created?page=0&size=${maxPageSize}`;
  const { data, error, isLoading, mutate } = useSWR<ProductRegistrationDTOV2[]>(path, fetcherGET);
  const count = Array.isArray(data) ? data.length : 0;
  return { data, count, error, isLoading, mutate };
}
