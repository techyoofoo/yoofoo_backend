import { create, getAll, updatePermissionById, deletePermissionById, findPermissionById } from './index'

export const permissionroutes = [
    { method: 'POST', path: '/rouge/permission/create', handler: create },
    { method: 'GET', path: '/rouge/permission/get', handler: getAll },
    { method: 'PUT', path: '/rouge/permission/update/{id}', handler: updatePermissionById },
    { method: 'DELETE', path: '/rouge/permission/delete/{id}', handler: deletePermissionById },
    { method: 'GET', path: '/rouge/permission/get/{id}', handler: findPermissionById }
]