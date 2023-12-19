import proxy, { ProxyOptions } from 'express-http-proxy'
import type { ExchangeToken } from './auth'
import { config } from './config'

function createProxy(
  host: string,
  targetAudience: string,
  exchangeIDPortenToken: ExchangeToken,
  options: ProxyOptions
) {
  return proxy(host, {
    parseReqBody: false,
    async proxyReqOptDecorator(requestOptions, req) {
      const { access_token } = await exchangeIDPortenToken(req, targetAudience)
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${access_token}`,
      }
      return requestOptions
    },
    ...options,
  })
}

export const proxyHandlers = {
  api(exchangeIDPortenToken: ExchangeToken) {
    return createProxy(config.api.brille_api_base_url, config.api.brille_api_target_audience, exchangeIDPortenToken, {
      proxyReqPathResolver(req) {
        return req.originalUrl.replace('/hjelpemidler/barnebriller/', '/')
      },
    })
  },
}
