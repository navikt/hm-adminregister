declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production'
    NAIS_CLUSTER_NAME?: 'labs-gcp' | 'dev-gcp' | 'prod-gcp'

    BRILLE_API_BASE_URL?: string
    BRILLE_API_TARGET_AUDIENCE?: string

    IDPORTEN_JWKS_URI?: string
    IDPORTEN_CLIENT_ID?: string

    TOKEN_X_WELL_KNOWN_URL?: string
    TOKEN_X_TOKEN_ENDPOINT?: string
    TOKEN_X_CLIENT_ID?: string
    TOKEN_X_PRIVATE_JWK?: string

    PORT?: string

    GIT_COMMIT?: string

    USE_MSW?: 'true' | 'false'
  }
}
