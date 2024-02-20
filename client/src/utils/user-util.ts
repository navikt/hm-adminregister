import { LoggedInUserResponse } from "./response-types";

export interface LoggedInUser {
  isAdmin: boolean;
  userId: string | undefined;
  supplierId: string | undefined;
  userName: string | undefined;
  supplierName: string | undefined;
}

export const mapLoggedInUser = (_source: LoggedInUserResponse): LoggedInUser => {
  return {
    isAdmin: _source.roles.includes("ROLE_ADMIN"),
    userId: String(_source.attributes["userId"]) ?? undefined,
    //kun supplier bruker får supplierId
    supplierId: String(_source.attributes["supplierId"]) ?? undefined,
    userName: String(_source.attributes["userName"]) ?? undefined,
    supplierName: String(_source.attributes["supplierName"]) ?? undefined,
  };
};
