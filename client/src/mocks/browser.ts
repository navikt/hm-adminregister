import { RequestHandler } from "msw";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";
import { unleashHandler } from "mocks/handlers/unleashHandler";
import { setupWorker } from "msw/browser";

const handlers: RequestHandler[] = [...tilGodkjenningHandlers, ...unleashHandler];

export const worker = setupWorker(...handlers);
