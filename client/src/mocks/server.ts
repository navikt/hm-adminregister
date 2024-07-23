import { setupServer } from "msw/node";
import { defaultSeriesHandlers } from "mocks/handlers/defaultSeriesHandlers";

export const server = setupServer(...defaultSeriesHandlers);
