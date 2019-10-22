import { getCurrentCommission, getSummeryCommission, getHistoricalCommission, getCommissionPeriod, getHistoricalBonusDetails,getVolumes } from './index'

export const commissionroutes = [
    { method: 'GET', path: '/currentcommission/{cid}', handler: getCurrentCommission },
    { method: 'GET', path: '/summerycommission/{cid}', handler: getSummeryCommission },
    { method: 'GET', path: '/historicalcommission/{cid}/{crid}', handler: getHistoricalCommission },
    { method: 'GET', path: '/commissionsperiod/', handler: getCommissionPeriod },
    { method: 'GET', path: '/historicalbonusdetails/{cid}/{crid}', handler: getHistoricalBonusDetails },
    { method: 'GET', path: '/volumes/{cid}/{ptid}/{pid}', handler: getVolumes }
]