import { create, getAll, updateProductById, deleteProductById, findProductById } from './index'

export const productoutes = [
    { method: 'POST', path: '/rouge/product/create', handler: create },
    { method: 'GET', path: '/rouge/product/get', handler: getAll },
    { method: 'PUT', path: '/rouge/product/update/{id}', handler: updateProductById },
    { method: 'DELETE', path: '/rouge/product/delete/{id}', handler: deleteProductById },
    { method: 'GET', path: '/rouge/product/get/{id}', handler: findProductById }
]