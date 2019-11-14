import sql from 'mssql';

import {
    getSummaryCommissions,
    getCommissionPeriod,
    getCurrentPeriod,
    getPeriods,
    getHistoricalCommissions,
    getVolumes,
    getHistoricalBonusDetails,
    getRealTimePeriods,
    getRealTimeCommissions,
    getRealTimeCommissionDetails,
    exigoRealTimeCommissionDetails
} from './commissions';


export const getCurrentCommission = function (request, reply) {
    var config = {
        user: 'chalkcouture',
        password: 'B9V6~10|PX7v',
        server: 'exigosqlsyncsandbox.c61qznpqe2o1.us-west-1.rds.amazonaws.com',
        database: 'sandbox',
        port: 4433
    };

    return new Promise((resolve, reject) => {
        sql.connect(config, function (err) {
            var sqlrequest = new sql.Request();
            sqlrequest.input('CustomerId', sql.Int, request.params.cid)
                .query(`SELECT
                               pv.CustomerID
                              ,Total = c.Total
                              ,r.RankID
                              ,r.RankDescription
                              ,p.PeriodID
                              ,p.PeriodDescription
                        FROM PeriodVolumes AS pv
                             INNER JOIN Periods AS p 
                                    ON p.PeriodID = pv.PeriodID
                             JOIN CommissionRuns cr
                                    ON cr.PeriodID = p.PeriodID
                             JOIN Commissions c
                                    ON c.CommissionRunID = cr.CommissionRunID
                                    AND c.CustomerID = pv.CustomerID
                             INNER JOIN Ranks AS r 
                                    ON r.RankID = pv.PaidRankID
                             WHERE pv.CustomerID = @CustomerId
                                   AND pv.PeriodTypeId = 1
                                   AND p.EndDate BETWEEN '2019-04-17' 
                                   AND DATEADD(hh, -24, '2019-10-17')`,

                    function (err, recordset) {
                        if (err) {
                            sql.close();
                            resolve(reply.response(err).code(200));
                        }
                        else {
                            sql.close();
                            resolve(reply.response(recordset.recordset).code(200));
                        }
                    });
        });
    });
}

export const getCommissionDropdown = function (request, reply) {
    var config = {
        user: 'chalkcouture',
        password: 'B9V6~10|PX7v',
        server: 'exigosqlsyncsandbox.c61qznpqe2o1.us-west-1.rds.amazonaws.com',
        database: 'sandbox',
        port: 4433
    };

    var data = {
        CommissionPeriods: [],
        SummaryCommissions: [],
        DropDownData: []
    }

    return new Promise(async (resolve, reject) => {
        try {
            await sql.connect(config)

            const realTimeCommission = await getRealTimePeriods();

            realTimeCommission.forEach(element => {
                const period = {
                    PeriodID: element.PeriodID,
                    PeriodTypeID: element.PeriodTypeID,
                    PeriodDescription: element.PeriodDescription,
                    StartDate: element.StartDate,
                    EndDate: element.EndDate,
                    ActualEndDate: element.ActualEndDate
                }
                data.DropDownData.push({ Period: period, RunID: 0 })
            });

            data.CommissionPeriods = await getCommissionPeriod();

            data.CommissionPeriods.forEach(element => {
                const period = {
                    PeriodID: element.PeriodID,
                    PeriodTypeID: element.PeriodTypeID,
                    PeriodDescription: element.PeriodDescription,
                    StartDate: element.StartDate,
                    EndDate: element.EndDate,
                    ActualEndDate: element.ActualEndDate
                }
                data.DropDownData.push({ Period: period, RunID: element.CommissionRunID })
            });

            const currentPeriod = await getCurrentPeriod();
            const checkPeriod = data.DropDownData.find(function (element) {
                return (element.PeriodID === Number(currentPeriod.PeriodID) && element.PeriodTypeID === Number(currentPeriod.PeriodTypeID))
            });

            if (checkPeriod === undefined) {
                const period = {
                    PeriodID: currentPeriod.PeriodID,
                    PeriodTypeID: currentPeriod.PeriodTypeID,
                    PeriodDescription: currentPeriod.PeriodDescription,
                    StartDate: currentPeriod.StartDate,
                    EndDate: currentPeriod.EndDate,
                    ActualEndDate: currentPeriod.ActualEndDate
                }
                data.DropDownData.push({ Period: period, RunID: 0 })
            }
            var date = new Date('2018-07-01');
            var summaryCommission = await getSummaryCommissions(request.params.cid)
            data.SummaryCommissions = summaryCommission.filter(d => d.StartDate < date)

            data.SummaryCommissions.forEach(element => {
                const period = {
                    PeriodID: element.PeriodID,
                    PeriodTypeID: element.PeriodTypeID,
                    PeriodDescription: element.PeriodDescription,
                    StartDate: element.StartDate,
                    EndDate: element.EndDate,
                    ActualEndDate: element.ActualEndDate
                }
                data.DropDownData.push({ Period: period, RunID: 0 })
            });
            data.DropDownData =  data.DropDownData.sort((a, b) => b.Period.StartDate - a.Period.StartDate)
            sql.close()
            resolve(reply.response(data).code(200));
        }
        catch (err) {
            sql.close()
            throw err
        }
    });
}


export const getCommissionDetails = function (request, reply) {

    var config = {
        user: 'chalkcouture',
        password: 'B9V6~10|PX7v',
        server: 'exigosqlsyncsandbox.c61qznpqe2o1.us-west-1.rds.amazonaws.com',
        database: 'sandbox',
        port: 4433
    };

    var data = {
        HistoricalCommission: {},
        SummaryCommissions: {},

        HistoricalBonusDetails: {
            DeferredCommission: [],
            SponsorBonus: [],
            CoachingBonus: [],
            CuturierBonus: []
        },
        Volumes: {},
        RealTimeCommissions: [],
        RealTimeCommissionDetails: {}
    }

    return new Promise(async (resolve, reject) => {

        try {
            await sql.connect(config)

            let periods = await getPeriods(1, request.params.pid)
            const period = periods[0]
            const date = new Date('2018-07-01');
            if (period !== undefined && period.StartDate < date) {
                let summeryCommissions = await getSummaryCommissions(request.params.cid)
                summeryCommissions = summeryCommissions.filter(d => d.PeriodID === period.PeriodID)
                data.SummaryCommissions = summeryCommissions[0]
                data.HistoricalBonusDetails = {}
                data.RealTimeCommissionDetails = {}
                sql.close()
                return resolve(reply.response(data).code(200));
            };

            if (Number(request.params.crid) === 0) {
                var rtCommissionResult = await getRealTimeCommissions()
                data.RealTimeCommissions = rtCommissionResult;
                var rtCommissionDetailsResult = await getRealTimeCommissionDetails(Number(request.params.pid));
                data.RealTimeCommissionDetails = rtCommissionDetailsResult
                data.HistoricalBonusDetails = {}
                sql.close()
                return resolve(reply.response(data).code(200));
            }
            else {
                let historicalCommissions = await getHistoricalCommissions(request.params.cid, request.params.crid)
                data.HistoricalCommission = historicalCommissions[0]

                let volumes = await getVolumes(request.params.cid, data.HistoricalCommission.PeriodTypeID, data.HistoricalCommission.PeriodID)
                data.Volumes = volumes[0]

                const hData = await getHistoricalBonusDetails(request.params.cid, request.params.crid)

                hData.forEach(function (dt) {
                    switch (dt.BonusID) {
                        case 1:
                            data.HistoricalBonusDetails.DeferredCommission.push(dt)
                            break;
                        case 5:
                            data.HistoricalBonusDetails.SponsorBonus.push(dt)
                            break;
                        case 6:
                            data.HistoricalBonusDetails.CoachingBonus.push(dt)
                            break;
                        case 7:
                            data.HistoricalBonusDetails.CuturierBonus.push(dt)
                            break;
                        default:
                            break;

                    }
                });
                data.RealTimeCommissionDetails = {}
                sql.close()
                return resolve(reply.response(data).code(200));
            }
        }
        catch (err) {
            sql.close()
            throw err
        }
    });
}
