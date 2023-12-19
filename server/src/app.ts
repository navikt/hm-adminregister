import express, { Express } from 'express'
import mustacheExpress from 'mustache-express'
import type { Auth } from './auth'
import { config } from './config'
import { routes } from './routes'

export function createApp(auth: Auth): Express {
  const router = express.Router()
  router.use(auth.verifyIDPortenToken)
  router.use('/api/', routes.api(auth.exchangeIDPortenToken))
  router.use('/internal/', routes.internal())
  router.use('/', routes.public())

  const app = express()
  app.use(config.base_path, router)
  app.set('views', config.build_path)
  app.set('view engine', 'mustache')
  app.engine('html', mustacheExpress())
  app.set('trust proxy', 1)

  return app
}
