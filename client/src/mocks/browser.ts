import { http, HttpResponse, RequestHandler } from "msw";
import { setupWorker } from "msw/browser";

export function apiPath(url: string = "") {
  return `http://localhost:8080/admreg/${url}`;
}

interface Params {
  param: string;
}

const handlers: RequestHandler[] = [
  http.get(apiPath(`admin/api/v1/test/`), async ({ params }) => {
    return HttpResponse.json();
  }),
];

export const worker = setupWorker(...handlers);
