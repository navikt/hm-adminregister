import { RequestHandler, setupWorker } from 'msw'


const handlers: RequestHandler[] = [

]

export const worker = setupWorker(...handlers)
