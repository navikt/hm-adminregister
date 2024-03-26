import { http, HttpResponse, RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { tilGodkjenningListe } from "mocks/data/tilGodkjenningListe";

export function apiPath(url: string = "") {
  return `http://localhost:8080/admreg/${url}`;
}

interface Params {
  param: string;
}

const handlers: RequestHandler[] = [
  http.get(apiPath(`admin/api/v1/product/til-godkjenning`), async ({ params }) => {
    return HttpResponse.json(tilGodkjenningListe);
  }),
];

export const worker = setupWorker(...handlers);
