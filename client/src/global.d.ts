interface Window {
  msw: any;
  appSettings: {
    USE_MSW?: boolean;
    GIT_COMMIT?: string;
    MILJO?: "local" | "dev-gcp" | "prod-gcp" | string;
  };
}
