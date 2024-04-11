import { config } from "./config";
import express from "express";
import { routes } from "./routes";

const router = express.Router();
router.use("/internal/", routes.internal());
router.get("/settings.js", (_, res) => {
  const appSettings = {
    VITE_HM_REGISTER_URL: process.env.VITE_HM_REGISTER_URL,
    VITE_IMAGE_PROXY_URL: process.env.VITE_IMAGE_PROXY_URL,
  };
  res.type(".js");
  res.send(`window.appSettings = ${JSON.stringify(appSettings)}`);
});

router.use("/", routes.public());

const app = express();

app.use(config.base_path, router);
app.listen(config.port, () => console.info(`Listening on port ${config.port}`));
