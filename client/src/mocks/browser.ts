import { RequestHandler, setupWorker } from "msw";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";
import { unleashHandler } from "mocks/handlers/unleashHandler";

const handlers: RequestHandler[] = [...tilGodkjenningHandlers, ...unleashHandler];

export const worker = setupWorker(...handlers);
