import { create, getAll, updateById, deleteById, findById } from './index'

export const schemaroutes = [
    { method: 'POST', path: '/rouge/common/crud/create/{table_name}', handler: create },
    { method: 'GET', path: '/rouge/common/crud/get/{table_name}', handler: getAll },
    { method: 'PUT', path: '/rouge/common/crud/update/{table_name}/{id}', handler: updateById },
    { method: 'DELETE', path: '/rouge/common/crud/delete/{table_name}/{id}', handler: deleteById },
    { method: 'GET', path: '/rouge/common/crud/get/{table_name}/{id}', handler: findById }
]