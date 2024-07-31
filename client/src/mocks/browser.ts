import { RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";
import { unleashHandler } from "mocks/handlers/unleashHandler";

const handlers: RequestHandler[] = [...tilGodkjenningHandlers, ...unleashHandler];

export const worker = setupWorker(...handlers);
