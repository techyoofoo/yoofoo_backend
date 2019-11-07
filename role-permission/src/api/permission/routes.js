import { getAll } from './index'

export const permissionroutes = [
    { method: 'GET', path: '/rouge/permission/get', handler: getAll }
]