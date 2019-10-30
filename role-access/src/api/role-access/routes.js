import { create, getAll, updateRoleAccessById, deleteRoleAccessById, findRoleAccessById } from './index'

export const roleaccessroutes = [
    { method: 'POST', path: '/rouge/roleaccess/create', handler: create },
    { method: 'GET', path: '/rouge/roleaccess/get', handler: getAll },
    { method: 'PUT', path: '/rouge/roleaccess/update/{id}', handler: updateRoleAccessById },
    { method: 'DELETE', path: '/rouge/roleaccess/delete/{id}', handler: deleteRoleAccessById },
    { method: 'GET', path: '/rouge/roleaccess/get/{id}', handler: findRoleAccessById }
]