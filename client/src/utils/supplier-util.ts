import {
  DraftStatus,
  SupplierChunk,
  SupplierRegistrationDTO,
  SupplierStatus,
  SupplierUserChunk,
  UserDTO,
} from "./types/response-types";

export interface Supplier {
  id: string;
  status: SupplierStatus;
  name: string;
  address?: string | null;
  postNr?: string | null;
  postLocation?: string | null;
  countryCode?: string | null;
  email?: string | null;
  phone?: string | null;
  homepageUrl?: string | null;
}

export interface SupplierUser {
  id: string;
  name: string;
  email?: string | null;
  roles?: string[] | null;
  attributes?: {
    phone: string | null;
  } | null;
  create?: string | null;
  updated?: string | null;
}

export const mapSupplier = (_source: SupplierRegistrationDTO): Supplier => {
  return {
    id: _source.id,
    status: _source.status,
    name: _source.name,
    address: _source.supplierData.address,
    postNr: _source.supplierData.postNr,
    postLocation: _source.supplierData.postLocation,
    countryCode: _source.supplierData.countryCode,
    email: _source.supplierData.email,
    phone: _source.supplierData.phone,
    homepageUrl: _source.supplierData.homepage,
  };
};

export const mapSuppliers = (data: SupplierChunk): Supplier[] => {
  return data.content.map((supplierRegistrationDTO) => {
    return mapSupplier(supplierRegistrationDTO);
  });
};

export const mapSuppliersUser = (
  _source: UserDTO,
): {
  roles: string[];
  name: string;
  create: string;
  attributes: { [phone: string]: string };
  id: string;
  updated: string;
  email: string;
} => {
  return {
    id: _source.id,
    name: _source.name,
    email: _source.email,
    roles: _source.roles,
    attributes: _source.attributes,
    create: _source.created,
    updated: _source.updated,
  };
};

export const mapSuppliersUsers = (
  data: SupplierUserChunk,
): {
  roles: string[];
  name: string;
  create: string;
  attributes: { [p: string]: string };
  id: string;
  updated: string;
  email: string;
}[] => {
  return data.content.map((UserDTO) => {
    return mapSuppliersUser(UserDTO);
  });
};

export interface SupplierUserDTO {
  name?: string | null;
  email: string;
  password: string;
  roles: string[];
  attributes: {};
}

export interface SupplierDTOBody {
  name: string;
  supplierData: {
    email: string;
    phone: string;
    homepage: string;
  };
}
