import type { Request, RequestHandler } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import jwt from 'jsonwebtoken'
import { JWK } from 'node-jose'
import { Issuer, TokenSet } from 'openid-client'
import { ulid } from 'ulid'
import { URL } from 'url'
import { config } from './config'
import { logger } from './logger'

export interface ExchangeToken {
  (req: Request, targetAudience: string): Promise<TokenSet>
}

export interface Auth {
  verifyIDPortenToken: RequestHandler
  exchangeIDPortenToken: ExchangeToken
}

export async function createAuth(): Promise<Auth> {
  if (config.is_labs) {
    logger.warn('Bruker auth-stub!')
    return createAuthStub()
  }
  const idPortenJWKSet = createRemoteJWKSet(new URL(config.auth.idporten_jwks_uri))
  const tokenXIssuer = await Issuer.discover(config.auth.tokenx_well_known_url)
  const tokenXClient = new tokenXIssuer.Client({
    client_id: config.auth.tokenx_client_id,
    token_endpoint_auth_method: 'none',
  })
  return {
    async verifyIDPortenToken(req, res, next) {
      if (req.path.startsWith('/internal/')) {
        next()
        return
      }
      try {
        const idPortenToken = getBearerToken(req)
        if (!idPortenToken) {
          logger.warn('Bearer token mangler')
          res.sendStatus(401)
          return
        }
        const result = await jwtVerify(idPortenToken, idPortenJWKSet, {
          algorithms: ['RS256'],
        })
        if (result.payload.client_id !== config.auth.idporten_client_id) {
          logger.warn(`client_id er ikke riktig, payload.client_id: ${result.payload.client_id}`)
          res.sendStatus(401)
          return
        }
        const aksepterteAcrs = ['Level4', 'idporten-loa-high']

        if (!aksepterteAcrs.includes(result.payload.acr as any)) {
          logger.warn(`acr er ikke riktig, payload.acr: ${result.payload.acr}`)
          res.sendStatus(403)
          return
        }

        next()
      } catch (err: unknown) {
        logger.error(`Verifisering av token feilet: ${err}`)
        res.sendStatus(401)
      }
    },
    async exchangeIDPortenToken(req, targetAudience) {
      const idPortenToken = getBearerToken(req)
      const clientAssertion = await createClientAssertion()
      try {
        return tokenXClient.grant({
          grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
          audience: targetAudience,
          client_assertion: clientAssertion,
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          subject_token: idPortenToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
          token_endpoint_auth_method: 'private_key_jwt',
        })
      } catch (err: unknown) {
        logger.error(`Feil under token exchange: ${err}`)
        return Promise.reject(err)
      }
    },
  }
}

export function createAuthStub(expectedToken?: string): Auth {
  return {
    verifyIDPortenToken(req, res, next) {
      if (expectedToken == null || expectedToken === getBearerToken(req)) {
        next()
      } else {
        res.sendStatus(401)
      }
    },
    exchangeIDPortenToken(req) {
      return Promise.resolve(new TokenSet({ access_token: getBearerToken(req) }))
    },
  }
}

function getBearerToken(req: Request): string | undefined {
  return req.headers['authorization']?.split(' ')[1]
}

async function createClientAssertion(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const key = await JWK.asKey(config.auth.tokenx_private_jwk)
  return jwt.sign(
    {
      sub: config.auth.tokenx_client_id,
      aud: config.auth.tokenx_token_endpoint,
      iss: config.auth.tokenx_client_id,
      exp: now + 60, // max 120
      iat: now,
      jti: ulid(),
      nbf: now,
    },
    key.toPEM(true),
    { algorithm: 'RS256' }
  )
}
