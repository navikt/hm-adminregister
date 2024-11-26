import { RequestHandler } from "msw";
import { tilGodkjenningHandlers } from "mocks/handlers/tilGodkjenningHandler";
import { unleashHandler } from "mocks/handlers/unleashHandler";
import { setupWorker } from "msw/browser";
import { resetPasswordHandler } from "mocks/handlers/resetPasswordHandler";

const handlers: RequestHandler[] = [...tilGodkjenningHandlers, ...unleashHandler, ...resetPasswordHandler];

export const worker = setupWorker(...handlers);
