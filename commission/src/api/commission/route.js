import { getCurrentCommission,
     getCommissionDropdown,
     getCommissionDetails } from './index'

export const commissionroutes = [
    { method: 'GET', path: '/currentcommission/{cid}', handler: getCurrentCommission },
    { method: 'GET', path: '/periodlist/{cid}', handler: getCommissionDropdown },
    { method: 'GET', path: '/commissiondetails/{cid}/{crid}/{pid}', handler: getCommissionDetails }
]