import { http, HttpResponse } from "msw";

export const unleashHandler = [
  http.get<any, any, Record<string, boolean>>(`/adminregister/features`, async (info) => {
    return HttpResponse.json({ lokalFlag: false });
  }),
];
