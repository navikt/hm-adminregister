import { baseUrl } from "utils/swr-hooks";

export async function initMsw(): Promise<unknown> {
  console.log(window.appSettings.MILJO);
  console.log(window.appSettings.USE_MSW);
  if (!window.appSettings.USE_MSW) {
    return;
  }

  const { worker } = await import("../mocks/browser");
  worker.listHandlers().forEach((handler) => {
    console.log(handler.info.header);
  });
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: baseUrl("/mockServiceWorker.js"),
    },
  });
}
