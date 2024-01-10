interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_HM_REGISTER_URL: string;
  readonly VITE_IMAGE_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
