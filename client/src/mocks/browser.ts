import { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";

const handlers: RequestHandler[] = [...tilGodkjenningHandlers];

export const worker = setupWorker(...handlers);
