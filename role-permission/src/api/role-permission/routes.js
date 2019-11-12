import { create, getAll, updateRolePermissionById, deleteRolePermissionById, findRolePermissionById ,removePermissionFromRolePermission} from './index'

export const rolepermissionroutes = [
    { method: 'POST', path: '/rouge/rolepermission/create', handler: create },
    { method: 'GET', path: '/rouge/rolepermission/get', handler: getAll },
    { method: 'PUT', path: '/rouge/rolepermission/update/{id}', handler: updateRolePermissionById },
    { method: 'DELETE', path: '/rouge/rolepermission/delete/{id}', handler: deleteRolePermissionById },
    { method: 'GET', path: '/rouge/rolepermission/get/{id}', handler: findRolePermissionById },
    { method: 'DELETE', path: '/rouge/rolepermission/deletepermission/{id}', handler: removePermissionFromRolePermission }
]