import { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";

export function apiPath(url: string = "") {
  return `http://localhost:8080/admreg/${url}`;
}

const handlers: RequestHandler[] = [...tilGodkjenningHandlers];

export const worker = setupWorker(...handlers);
