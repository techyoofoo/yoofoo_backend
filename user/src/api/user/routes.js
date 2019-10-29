import { create, getAll, updateUserById, deleteUserById, findUserById } from './index'

export const userroutes = [
    { method: 'POST', path: '/rouge/user/create', handler: create },
    { method: 'GET', path: '/rouge/user/get', handler: getAll },
    { method: 'PUT', path: '/rouge/user/update/{id}', handler: updateUserById },
    { method: 'DELETE', path: '/rouge/user/delete/{id}', handler: deleteUserById },
    { method: 'GET', path: '/rouge/user/get/{id}', handler: findUserById }
]