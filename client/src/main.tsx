import "@navikt/ds-css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "App";
import "./i18n";
import "./styles/globals.scss";
import { baseUrl } from "utils/swr-hooks";
import { initMsw } from "mocks/initMsw";
import { initInstrumentation } from "faro/faro";
import { initUmami } from "utils/umami";

initMsw().then(() => {
  initInstrumentation();
  initUmami();

  const container = document.getElementById("root")!;
  createRoot(container).render(
    <>
      <BrowserRouter basename={baseUrl()}>
        <App />
      </BrowserRouter>
    </>,
  );
});
