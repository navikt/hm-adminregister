import supertest from 'supertest'
import { createApp } from '../src/app'
import { createAuthStub } from '../src/auth'

export const testApp = {
  app() {
    return supertest(createApp(createAuthStub('secret')))
  },
  async get(url: string, token = 'secret') {
    return this.app()
      .get(url)
      .set(token ? { Authorization: `Bearer ${token}` } : {})
  },
}
