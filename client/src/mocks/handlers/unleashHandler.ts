import { rest } from "msw";

export const unleashHandler = [
  rest.get<any, any, Record<string, boolean>>(`/adminregister/features`, async (req, res, ctx) => {
    return res(ctx.json({ lokalFlag: false }));
  }),
];
