import { create, getAll, updateCompanyById, deleteCompanyById, findCompanyById } from './index'


export const companyroutes = [
    { method: 'POST', path: '/rouge/company/create', handler: create },
    { method: 'GET', path: '/rouge/company/get', handler: getAll },
    { method: 'PUT', path: '/rouge/company/update/{id}', handler: updateCompanyById },
    { method: 'DELETE', path: '/rouge/company/delete/{id}', handler: deleteCompanyById },
    { method: 'GET', path: '/rouge/company/get/{id}', handler: findCompanyById }
]