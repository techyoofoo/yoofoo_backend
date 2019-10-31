import { create, getAll, updateRoleById, deleteRoleById, findRoleById } from './index'

export const roleroutes = [
    { method: 'POST', path: '/rouge/role/create', handler: create },
    { method: 'GET', path: '/rouge/role/get', handler: getAll },
    { method: 'PUT', path: '/rouge/role/update/{id}', handler: updateRoleById },
    { method: 'DELETE', path: '/rouge/role/delete/{id}', handler: deleteRoleById },
    { method: 'GET', path: '/rouge/role/get/{id}', handler: findRoleById }
]