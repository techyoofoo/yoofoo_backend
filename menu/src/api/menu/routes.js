import { create, getAll, updateMenuById, deleteMenuById, findMenuById } from './index'

export const menuroutes = [
    { method: 'POST', path: '/rouge/menu/create', handler: create },
    { method: 'GET', path: '/rouge/menu/get', handler: getAll },
    { method: 'PUT', path: '/rouge/menu/update/{id}', handler: updateMenuById },
    { method: 'DELETE', path: '/rouge/menu/delete/{id}', handler: deleteMenuById },
    { method: 'GET', path: '/rouge/menu/get/{id}', handler: findMenuById }
]