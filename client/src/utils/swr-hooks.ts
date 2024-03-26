import {
  AdminUserChunk,
  AgreementsChunk,
  DelkontraktRegistrationDTO,
  IsoCategoryDTO,
  ProductRegistrationDTO,
  ProductVariantsForDelkontraktDto,
  ProdukterTilGodkjenningChunk,
  SeriesChunk,
  SupplierChunk,
  SupplierRegistrationDTO,
  UserDTO,
} from "./types/response-types";
import { mapSuppliers } from "./supplier-util";
import { useHydratedErrorStore } from "./store/useErrorStore";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import useSWR, { Fetcher } from "swr";
import { HM_REGISTER_URL } from "environments";
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
      if (res.status === 401) {
        window.location.href = `${baseUrl("/logg-inn")}`;
        return res.json();
      }
      return res.json().then((data) => {
        throw new CustomError(data.errorMessage || res.statusText, res.status);
      });
    }
    return res.json();
  });

export function useProducts() {
  const { setGlobalError } = useHydratedErrorStore();

  const { loggedInUser } = useAuthStore();

  const path = loggedInUser?.isAdmin
    ? `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/registrations/series/group`
    : `${HM_REGISTER_URL()}/admreg/vendor/api/v1/product/registrations/series/group`;

  const { data, error, isLoading } = useSWR<SeriesChunk>(loggedInUser ? path : null, fetcherGET);

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

export function useProductsTilGodkjenning() {
  const { setGlobalError } = useHydratedErrorStore();

  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/til-godkjenning`;

  const { data, error, isLoading } = useSWR<ProdukterTilGodkjenningChunk>(loggedInUser ? path : null, fetcherGET);

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

export function usePagedProductsTilGodkjenning({ page, pageSize }: { page: number; pageSize: number }) {
  const { setGlobalError } = useHydratedErrorStore();

  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/product/til-godkjenning?page=${page}&size=${pageSize}`;

  const { data, error, isLoading } = useSWR<ProdukterTilGodkjenningChunk>(loggedInUser ? path : null, fetcherGET);

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

export function usePagedAgreements({ page, pageSize }: { page: number; pageSize: number }) {
  const { setGlobalError } = useHydratedErrorStore();
  const { loggedInUser } = useAuthStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/registrations?page=${page}&size=${pageSize}&excludedAgreementStatus=DELETED`;

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

export function useDelkontrakterByAgreementId(agreementId: string) {
  const { setGlobalError } = useHydratedErrorStore();

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

export function useDelkontraktByDelkontraktId(delkontraktId: string) {
  const { setGlobalError } = useHydratedErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/agreement/delkontrakt/registrations/${delkontraktId}`;

  const { data, error, isLoading, mutate } = useSWR<DelkontraktRegistrationDTO>(path, fetcherGET);

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
  const { setGlobalError } = useHydratedErrorStore();

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

export function useProductVariantsBySeriesId(seriesId?: string) {
  const { setGlobalError } = useHydratedErrorStore();

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
  const { setGlobalError } = useHydratedErrorStore();
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
  const { setGlobalError } = useHydratedErrorStore();
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
  const { setGlobalError } = useHydratedErrorStore();
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
  const { setGlobalError } = useHydratedErrorStore();

  const path = `${HM_REGISTER_URL()}/admreg/admin/api/v1/supplier/registrations`;
  const { data, error, isLoading } = useSWR<SupplierChunk>(path, fetcherGET);
  const suppliers = data && mapSuppliers(data);

  if (error) {
    setGlobalError(error.status, error.message);
    throw error;
  }

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
  const { setGlobalError } = useHydratedErrorStore();

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
