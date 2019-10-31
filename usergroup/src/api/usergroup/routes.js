import { create, getAll, updateGroupById, deleteGroupById, findGroupById } from './index'

export const grouproutes = [
    { method: 'POST', path: '/rouge/usergroup/create', handler: create },
    { method: 'GET', path: '/rouge/usergroup/get', handler: getAll },
    { method: 'PUT', path: '/rouge/usergroup/update/{id}', handler: updateGroupById },
    { method: 'DELETE', path: '/rouge/usergroup/delete/{id}', handler: deleteGroupById },
    { method: 'GET', path: '/rouge/usergroup/get/{id}', handler: findGroupById }
]