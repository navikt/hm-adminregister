import { HM_REGISTER_URL } from "environments";

export const getPath = (isAdmin: boolean, path: string): string =>
  `${HM_REGISTER_URL()}${isAdmin ? "/admreg/admin" : "/admreg/vendor"}${path}`;

export const fetchAPI = async (url: string, method: string, body?: any): Promise<any> => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const json = await response.json();
    const error = { message: json?.data?.errorMessage || response.statusText, status: response.status };
    return Promise.reject(error);
  }
};

export const fetchAPIAttachment = async (url: string, method: string, body?: any): Promise<any> => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    body: body ? body : undefined,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const json = await response.json();
    const error = { message: json?.data?.errorMessage || response.statusText, status: response.status };
    return Promise.reject(error);
  }
};

export const httpDelete = async (url: string, method: string, body?: any): Promise<any> => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    return response.ok;
  } else {
    const json = await response.json();
    const error = { message: json?.data?.errorMessage || response.statusText, status: response.status };
    return Promise.reject(error);
  }
};

export const fetchAPIWithHeaders = async (url: string, method: string, body?: any, headers?: any): Promise<any> => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: headers,
    body: body ? body : undefined,
  });

  if (response.ok) {
    return await response.json();
  } else {
    const json = await response.json();
    const error = { message: json?.data?.errorMessage || response.statusText, status: response.status };
    return Promise.reject(error);
  }
};

export const fetchAPIWithHeadersAndArrayBufferResponse = async (
  url: string,
  method: string,
  body?: any,
  headers?: any,
): Promise<any> => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: headers,
    body: body ? body : undefined,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    const json = await response.json();
    const error = { message: json?.data?.errorMessage || response.statusText, status: response.status };
    return Promise.reject(error);
  }
};
