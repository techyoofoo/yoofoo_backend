import { create, findServerById } from './index'

export const serverroutes = [
    { method: 'POST', path: '/rouge/server/create', handler: create },
    { method: 'GET', path: '/rouge/server/get/{id}', handler: findServerById }
]