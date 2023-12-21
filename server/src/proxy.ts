import proxy, { ProxyOptions } from 'express-http-proxy'
import { config } from './config'

function createProxy(
    host: string,
    options: ProxyOptions
) {
    return proxy(host, {
        parseReqBody: false,
        async proxyReqOptDecorator(requestOptions, req) {
            requestOptions.headers = {
                ...requestOptions.headers,
            }
            return requestOptions
        },
        ...options,
    })
}

export const proxyHandlers = {
    api() {
        return createProxy(config.api.hm_register_url, {
            proxyReqPathResolver(req) {
                return req.originalUrl
            },
        })
    },
}
