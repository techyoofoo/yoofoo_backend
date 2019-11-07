import { rolepermissionroutes } from './role-permission/routes'
import { permissionroutes } from './permission/routes'

export const routes = rolepermissionroutes.concat(permissionroutes);

export default routes