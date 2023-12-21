import { config } from './config'
import express from "express";
import { routes } from "./routes";


const router = express.Router()
router.use('/internal/', routes.internal())
router.use('/', routes.public())
//router.use('/admreg/', routes.api())

const app = express()
app.use(config.base_path, router)
app.set('trust proxy', 1)
app.listen(config.port, () => console.info(`Listening on port ${config.port}`))
