import { fetchAPI, fetchAPIModify, getPath, httpDelete } from "api/fetch";
import { HM_REGISTER_URL } from "environments";
import { baseUrl, fetcherGET } from "utils/swr-hooks";
import { useAuthStore } from "utils/store/useAuthStore";
import { SupplierUser } from "utils/supplier-util";
import useSWR from "swr";
import { OTPRequest, ResetPasswordRequest, VerifyOTPRequest } from "utils/types/response-types";

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
  httpDelete(`${HM_REGISTER_URL()}/admreg/admin/api/v1/reset-password/${userId}`, "DELETE");

export const requestOtpForPasswordReset = async (email: string): Promise<void> => {
  const otpRequest: OTPRequest = { email };
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/reset-password/otp`, "POST", otpRequest);
};

export const verifyOtp = async (otp: string, email: string): Promise<void> => {
  const otpRequest: VerifyOTPRequest = { otp: otp, email: email };
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/reset-password/otp/verify`, "POST", otpRequest);
};

export const resetPassword = async (otp: string, email: string, password: string): Promise<void> => {
  const resetPasswordRequest: ResetPasswordRequest = { otp: otp, email: email, newPassword: password };
  return await fetchAPIModify(`${HM_REGISTER_URL()}/admreg/api/v1/reset-password`, "POST", resetPasswordRequest);
};
