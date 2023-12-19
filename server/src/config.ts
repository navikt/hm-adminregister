import path from 'path'

export const config = {
  base_path: process.env.NODE_ENV === 'production' ? '/hjelpemidler/barnebriller/' : '/',
  build_path: path.join(__dirname, '../../client/dist'),
  port: process.env.PORT || 5000,
  node_env: process.env.NODE_ENV || 'production',
  nais_cluster_name: process.env.NAIS_CLUSTER_NAME || 'labs-gcp',
  is_labs: process.env.IS_LABS || false,
  use_msw: process.env.USE_MSW === 'true',
  git_commit: process.env.GIT_COMMIT || 'Ukjent',
  api: {
    brille_api_base_url: process.env.BRILLE_API_BASE_URL || 'http://localhost:9090',
    brille_api_target_audience: process.env.BRILLE_API_TARGET_AUDIENCE || 'local:hm-brille-api',
  },
  auth: {
    idporten_jwks_uri: process.env.IDPORTEN_JWKS_URI || 'http://localhost:8080/default/jwks',
    idporten_client_id: process.env.IDPORTEN_CLIENT_ID || 'default',
    tokenx_well_known_url: process.env.TOKEN_X_WELL_KNOWN_URL || 'http://localhost:8080/default',
    tokenx_token_endpoint: process.env.TOKEN_X_TOKEN_ENDPOINT || 'http://localhost:8080/default/token',
    tokenx_client_id: process.env.TOKEN_X_CLIENT_ID || 'default',
    tokenx_private_jwk: process.env.TOKEN_X_PRIVATE_JWK || '',
  },
}
