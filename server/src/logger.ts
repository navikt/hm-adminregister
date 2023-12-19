import ecsFormat from '@elastic/ecs-winston-format'
import { createLogger, transports } from 'winston'

export const logger = createLogger({
  level: 'info',
  format: ecsFormat({ convertReqRes: true }),
  transports: [new transports.Console()],
})
