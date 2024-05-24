import { setupServer } from "msw/node";
import { noContentHandlers } from "mocks/handlers/noContentHandlers";

export const server = setupServer(...noContentHandlers);