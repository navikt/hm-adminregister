import { createApp } from './app'
import { createAuth } from './auth'
import { config } from './config'
import { logger } from './logger'

createAuth()
  .then((auth) => createApp(auth))
  .then((app) => app.listen(config.port, () => logger.info(`Listening on port ${config.port}`)))
  .catch((err: unknown) => {
    logger.error(err)
    process.exit(1)
  })
