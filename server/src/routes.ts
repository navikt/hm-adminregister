import cookieParser from "cookie-parser";
import express, { Router } from "express";
import { config } from "./config";
import { createMetrics } from "./metrics";
import path from "path";

export const routes = {
  internal(): Router {
    const metrics = createMetrics();
    return Router()
      .get("/isalive", (_, res) => res.send("alive"))
      .get("/isready", (_, res) => res.send("ready"))
      .get("/metrics", async (req, res) => {
        res.set("Content-Type", metrics.contentType);
        res.end(await metrics.metrics());
      });
  },
  public(): Router {
    return Router()
      .use(cookieParser())
      .get("/settings.js", (_, res) => {
        const appSettings = {
          VITE_HM_REGISTER_URL: process.env.VITE_HM_REGISTER_URL,
          VITE_IMAGE_PROXY_URL: process.env.VITE_IMAGE_PROXY_URL,
          USE_MSW: process.env.USE_MSW === "true",
          MILJO: process.env.NAIS_CLUSTER_NAME,
        };
        res.type(".js");
        res.send(`window.appSettings = ${JSON.stringify(appSettings)}`);
      })
      .get("*", express.static(config.build_path))
      .get("*", function (req, res) {
        res.sendFile("index.html", { root: path.join(__dirname, "../../client/dist/") });
      });
  },
};
