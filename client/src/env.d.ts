interface ImportMetaEnv {
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly VITE_HM_REGISTER_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
