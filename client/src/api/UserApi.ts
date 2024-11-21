import { getPath, httpDelete } from "api/fetch";
import { HM_REGISTER_URL } from "environments";
import { fetcherGET } from "utils/swr-hooks";
import { useAuthStore } from "utils/store/useAuthStore";
import { SupplierUser } from "utils/supplier-util";
import useSWR from "swr";

export function useSupplierUsers(supplierId: string) {
  const { loggedInUser } = useAuthStore();

  const endOfPath = loggedInUser?.isAdmin ? `/api/v1/users/supplierId/${supplierId}` : "/api/v1/users";

  const usersPath = getPath(loggedInUser?.isAdmin || false, endOfPath);

  const { data: users, error, isLoading, mutate } = useSWR<SupplierUser[]>(loggedInUser ? usersPath : null, fetcherGET);

  return {
    users,
    isLoading,
    error,
    mutate,
  };
}

export const deleteUser = (userId: string): Promise<void> =>
  httpDelete(`${HM_REGISTER_URL()}/admreg/admin/api/v1/users/${userId}`, "DELETE");
