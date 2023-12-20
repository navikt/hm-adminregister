import cookieParser from 'cookie-parser'
import express, { RequestHandler, Router } from 'express'
import type { ExchangeToken } from './auth'
import { config } from './config'
import { createMetrics } from './metrics'
import { proxyHandlers } from './proxy'
import path from "path";

export const routes = {
  internal(): Router {
    const metrics = createMetrics()
    return Router()
      .get('/isalive', (_, res) => res.send('alive'))
      .get('/isready', (_, res) => res.send('ready'))
      .get('/metrics', async (req, res) => {
        res.set('Content-Type', metrics.contentType)
        res.end(await metrics.metrics())
      })
  },
  api(exchangeIDPortenToken: ExchangeToken): Router {
    return Router().use(proxyHandlers.api(exchangeIDPortenToken))
  },
  public(): Router {
    return Router()
      .use(cookieParser())
        .get('*', express.static(config.build_path))
        .get('*', function (req, res) {
          res.sendFile('index.html', {root: path.join(__dirname, '../../client/dist/')});
        });
  },

}

const spaHandler: RequestHandler = async (req, res) => {

  res.sendFile(path.join(__dirname, "public", "index.html"));

}

const settingsHandler: RequestHandler = (req, res) => {
  const appSettings = {
    GIT_COMMIT: config.git_commit,
    MILJO: config.is_labs ? 'labs-gcp' : config.nais_cluster_name,
    USE_MSW: config.use_msw,
  }
  res.type('.js')
  res.send(`window.appSettings = ${JSON.stringify(appSettings)}`)
}
