import sql from 'mssql';
import soapRequest from 'easy-soap-request';
import { transform, prettyPrint } from 'camaro';

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

            const realTimeCommission = await GetRealTimePeriods();

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

            const commissionPeriodResult = await sql.query`SELECT cr.CommissionRunID
                                          ,cr.CommissionRunDescription
                                          ,cr.RunDate
                                          ,cr.AcceptedDate
                                          ,cr.CommissionRunStatusID
                                          ,cr.HideFromWeb
                                          ,cr.PlanID
                                          ,p.PeriodID
                                          ,p.PeriodDescription
                                          ,p.PeriodTypeID
                                          ,p.StartDate
                                          ,p.EndDate
                                          ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                          ,p.AcceptedDate
                                    FROM CommissionRuns cr
                                         LEFT JOIN Periods p
                                              ON cr.PeriodID = p.PeriodID
                                              AND cr.PeriodTypeID = p.PeriodTypeID
                                         WHERE p.StartDate >= '2018-07-01'
                                         ORDER BY cr.PeriodID DESC`

            data.CommissionPeriods = commissionPeriodResult.recordset

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


            const currentPeriodResult = await sql.query`SELECT p.PeriodTypeID
                                        , p.PeriodID
                                        , p.PeriodDescription
                                        , p.StartDate
                                        , p.EndDate
                                        , dateadd(day, 1, p.EndDate) as ActualEndDate
                                        , p.AcceptedDate
                                    FROM Periods p
                                         WHERE p.PeriodTypeID = 1
                                               AND GETDATE() between p.StartDate and dateadd(day, 1, p.EndDate)
                                         ORDER BY p.AcceptedDate desc, p.EndDate desc`

            const currentPeriod = currentPeriodResult.recordset[0]
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

            const summaryCommissionResult = await sql.query`SELECT
                                              hs.DesignerID
                                             ,HSStartDate = hs.Period
                                             ,hs.PaidAsTitle
                                             ,hs.Commission
                                             ,hs.PV
                                             ,hs.TV
                                             ,hs.EV
                                             ,hs.PSQ
                                             ,hs.L1M
                                             ,hs.MML
                                             ,p.PeriodID
                                             ,p.PeriodTypeID
                                             ,p.PeriodDescription
                                             ,p.StartDate
                                             ,p.EndDate
                                             ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                        FROM [HistoricalCommission].[HistoricalSummary] hs
                                             INNER JOIN Periods p
                                                    ON CONVERT(date, hs.Period) = CONVERT(date, p.StartDate)
                                             WHERE p.StartDate < '2018-07-01' and designerid = ${request.params.cid}
                                             ORDER BY p.StartDate DESC`

            data.SummaryCommissions = summaryCommissionResult.recordset

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
            const periodResult = await sql.query`SELECT p.PeriodTypeID
                                   , p.PeriodID
                                   , p.PeriodDescription
                                   , p.StartDate
                                   , p.EndDate
                                   , dateadd(day, 1, p.EndDate) as ActualEndDate
                                   , p.AcceptedDate
                                FROM Periods p
                                    WHERE p.PeriodTypeID = 1
                                    AND p.PeriodID = ${request.params.pid}
                                    Order by p.PeriodID Desc`

            const period = periodResult.recordset[0]

            const date = new Date('2018-07-01');
            if (period !== undefined && period.StartDate < date) {
                const summaryCommissionResult = await sql.query` SELECT
                                     hs.DesignerID
                                    ,HSStartDate = hs.Period
                                    ,hs.PaidAsTitle
                                    ,hs.Commission
                                    ,hs.PV
                                    ,hs.TV
                                    ,hs.EV
                                    ,hs.PSQ
                                    ,hs.L1M
                                    ,hs.MML
                                    ,p.PeriodID
                                    ,p.PeriodTypeID
                                    ,p.PeriodDescription
                                    ,p.StartDate
                                    ,p.EndDate
                                    ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                FROM [HistoricalCommission].[HistoricalSummary] hs
                                     INNER JOIN Periods p
                                     ON CONVERT(date, hs.Period) = CONVERT(date, p.StartDate)
                                     WHERE p.PeriodID =${period.PeriodID} AND designerid = ${request.params.cid}
                                     ORDER BY p.StartDate DESC`

                data.SummaryCommissions = summaryCommissionResult.recordset[0]
                data.HistoricalBonusDetails = {}
                data.RealTimeCommissionDetails = {}
                sql.close()
                return resolve(reply.response(data).code(200));
            };

            if (Number(request.params.crid) === 0) {
                var rtCommissionResult = await GetRealTimeCommissions()
                data.RealTimeCommissions = rtCommissionResult;
                var rtCommissionDetailsResult = await GetRealTimeCommissionDetails(Number(request.params.pid));
                data.RealTimeCommissionDetails = rtCommissionDetailsResult
                data.HistoricalBonusDetails = {}
                sql.close()
                return resolve(reply.response(data).code(200));
            }
            else {
                const historicalCommissionResult = await sql.query` SELECT c.CommissionRunID
                                          ,c.CustomerID
                                          ,c.CurrencyCode
                                          ,c.Earnings
                                          ,c.PreviousBalance
                                          ,c.BalanceForward
                                          ,c.Fee
                                          ,c.Total
                                          ,cr.CommissionRunDescription
                                          ,cr.RunDate
                                          ,cr.CommissionRunStatusID
                                          ,cr.HideFromWeb
                                          ,cr.PlanID
                                          ,RankID = pv.PaidRankID
                                          ,r.RankDescription
                                          ,cr.PeriodID
                                          ,p.PeriodDescription
                                          ,p.PeriodTypeID
                                          ,p.StartDate
                                          ,p.EndDate
                                          ,dateadd(day, 1, p.EndDate) as ActualEndDate
                                          ,cr.AcceptedDate
                                    FROM Commissions c
                                         LEFT JOIN CommissionRuns cr
                                              ON c.CommissionRunID = cr.CommissionRunID
                                         LEFT JOIN Periods p
                                              ON cr.periodid = p.periodid
                                              and cr.periodtypeid = p.periodtypeid
                                         LEFT JOIN PeriodVolumes pv 
                                              ON pv.periodid = p.periodid
                                              and pv.periodtypeid = p.periodtypeid
                                              and pv.customerid = c.customerid
                                         LEFT JOIN Ranks r
                                              ON r.RankID = pv.PaidRankID
                                         WHERE c.CustomerID = ${request.params.cid}
                                              AND c.CommissionRunID = ${request.params.crid}
                                         ORDER BY cr.periodid DESC`

                data.HistoricalCommission = historicalCommissionResult.recordset[0]

                const volumeResult = await sql.query`Select 
                                             c.CustomerID			                        
                                           , ModifiedDate = isnull(pv.ModifiedDate, '01/01/1900')
                                           , Volume2 = isnull(pv.Volume2, 0)
                                           , Volume5 = isnull(pv.Volume5, 0)
                                           , Volume6 = isnull(pv.Volume6, 0)
                                           , Volume7 = isnull(pv.Volume7, 0)
                                           , Volume8 = isnull(pv.Volume8, 0)
                                           , Volume9 = isnull(pv.Volume9, 0)
                                           , PeriodID = p.PeriodID
                                           , PeriodTypeID = p.PeriodTypeID
                                           , PeriodDescription = p.PeriodDescription
                                           , StartDate = p.StartDate
                                           , EndDate = p.EndDate
                                           , ActualEndDate = dateadd(day, 1, p.EndDate)
                                           , RankID = isnull(pv.RankID,0)
                                           , RankDescription = isnull(r.RankDescription, '')
                                           , RankID = isnull(pv.PaidRankID,0)
                                           , RankDescription = isnull(pr.RankDescription, '') 
                                           , RankID = ISNULL((SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID),0)
                                           , RankDescription = ISNULL((select RankDescription from Ranks where RankID = (SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID)),'')
                                    FROM Customers c
                                         LEFT JOIN PeriodVolumes pv
                                              ON pv.CustomerID = c.CustomerID
                                         LEFT JOIN Periods p
                                              ON pv.PeriodID = p.PeriodID
                                              AND pv.PeriodTypeID = p.PeriodTypeID
                                         LEFT JOIN Ranks r
                                              ON r.RankID = c.RankID
                                         LEFT JOIN Ranks pr
                                              ON pr.RankID = pv.PaidRankID
                                         WHERE pv.CustomerID = ${request.params.cid}
                                              AND p.PeriodTypeID = ${data.HistoricalCommission.PeriodTypeID}
                                              AND p.PeriodID =${data.HistoricalCommission.PeriodID}`

                data.Volumes = volumeResult.recordset[0]

                const historicalBonusDetailsResult = await sql.query` SELECT TOP 24
                                          cd.BonusID
                                         ,b.BonusDescription
                                         ,cd.FromCustomerID
                                         ,FromCustomerName = c.FirstName + ' ' + c.LastName
                                         ,cd.Level
                                         ,cd.PaidLevel
                                         ,cd.Percentage
                                         ,cd.OrderID
                                     ,CASE
                                         WHEN cd.BonusID = 4 OR cd.BonusID = 5 OR cd.BonusID = 6 THEN pv.Volume2
                                         WHEN cd.BonusID = 8 THEN cd.SourceAmount / er.Rate
                                         ELSE cd.SourceAmount
                                         END AS SourceAmount
                                     ,CASE
                                         WHEN cd.BonusID = 4 OR cd.BonusID = 5 OR cd.BonusID = 6 THEN pv.Volume2 * cd.Percentage / 100
                                         WHEN cd.BonusID = 1 OR cd.BonusID = 8 THEN cd.SourceAmount / er.Rate
                                         ELSE cd.CommissionAmount
                                         END AS CommissionAmount
                                     FROM  CommissionDetails cd	
                                         INNER JOIN Customers c 
                                                ON c.CustomerID = cd.FromCustomerID
                                         INNER JOIN CommissionRuns cr
                                                ON cd.CommissionRunID = cr.CommissionRunID
                                         INNER JOIN PeriodVolumes pv 
                                                ON pv.CustomerID = cd.FromCustomerID AND cr.PeriodID = pv.PeriodID
                                         INNER JOIN CommissionExchangeRates er 
                                                ON er.CommissionRunID = cd.CommissionRunID AND cd.CurrencyCode = er.CurrencyCode
                                         INNER JOIN Bonuses b 
                                                ON b.BonusID = cd.BonusID
                                     WHERE
                                         cd.CustomerID = ${request.params.cid}
                                         AND cd.CommissionRunID = ${request.params.crid}`

                const hData = historicalBonusDetailsResult.recordset

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



async function GetRealTimePeriods() {
    const promise = new Promise(async (resolve, reject) => {
        const resultData = [];

        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': 'http://api.exigo.com/GetRealTimeCommissions',
        };

        const xml = `<soap:Envelope 
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Header>
                             <ApiAuthentication xmlns="http://api.exigo.com/">
                                   <LoginName>chalkapi</LoginName>
                                   <Password>5PhHK339B76k2eM8</Password>
                                   <Company>chalkcouture</Company>
                             </ApiAuthentication>
                        </soap:Header>
                        <soap:Body>
                              <GetRealTimeCommissionsRequest xmlns="http://api.exigo.com/">
                                    <CustomerID>967</CustomerID>
                              </GetRealTimeCommissionsRequest>
                        </soap:Body>
                    </soap:Envelope>`;

        const template = {
            CommissionsResult: ["//GetRealTimeCommissionsResult", {
                Result: ["//Result", {
                    Status: "Status",
                    Errors: "Errors",
                    TransactionKey: "TransactionKey"
                }],
                Commissions: ["//Commissions//CommissionResponse", {
                    CustomerID: "CustomerID",
                    PeriodType: "PeriodType",
                    PeriodID: "PeriodID",
                    PeriodDescription: "PeriodDescription",
                    CurrencyCode: "CurrencyCode",
                    CommissionTotal: "CommissionTotal",
                    Bonuses: ["//Bonuses//CommissionBonusResponse", {
                        Description: "Description",
                        Amount: "Amount",
                        BonusID: "BonusID"
                    }]
                }]
            }]
        };

        const errortemplate = {
            CustomerResult: ["//faultcode ", {
                faultstring: "//faultstring"
            }]
        };

        const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissions';

        const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
        const { body, statusCode } = response;
        const result = await transform(response.body, template);
        var resData = "";

        if (result.CommissionsResult.length > 0) {
            var realTimeCommission = [];
            const commissionResult = result.CommissionsResult[0].Commissions;
            commissionResult.forEach(function (commissiondata, index) {
                var commission = {
                    CustomerID: null,
                    PeriodType: null,
                    PeriodID: null,
                    PeriodDescription: '',
                    CurrencyCode: '',
                    CommissionTotal: '',
                    Bonuses: []
                }

                commission.CustomerID = commissiondata.CustomerID;
                commission.PeriodType = commissiondata.PeriodType;
                commission.PeriodID = commissiondata.PeriodID;
                commission.PeriodDescription = commissiondata.PeriodDescription;
                commission.CurrencyCode = commissiondata.CurrencyCode;
                commission.CommissionTotal = commissiondata.CommissionTotal;
                var bonuses = commissiondata.Bonuses;
                bonuses.forEach(function (data, index) {
                    const bonus = {
                        Description: '',
                        Amount: null,
                        BonusID: null,
                    }
                    bonus.Description = data.Description;
                    bonus.Amount = data.Amount;
                    bonus.BonusID = data.BonusID;
                    commission.Bonuses.push(bonus);
                })
                realTimeCommission.push(commission)
            })

            if (realTimeCommission.length === 0) {

                const currentPeriodResult = await sql.query`SELECT p.PeriodTypeID
                                , p.PeriodID
                                , p.PeriodDescription
                                , p.StartDate
                                , p.EndDate
                                , dateadd(day, 1, p.EndDate) as ActualEndDate
                                , p.AcceptedDate
                            FROM Periods p
                                 WHERE p.PeriodTypeID = 1
                                 AND @CurrentDate between p.StartDate and dateadd(day, 1, p.EndDate)
                                 ORDER BY p.AcceptedDate desc, p.EndDate desc`

                const period = currentPeriodResult.recordset
                var commission = {
                    CustomerID: 967,
                    PeriodType: 1,
                    PeriodID: period.PeriodID,
                    PeriodDescription: '',
                    CurrencyCode: 'usd',
                    CommissionTotal: '',
                    Bonuses: []
                }
                realTimeCommission.push(commission)
            }

            const periodIds = realTimeCommission.map(data => data.PeriodID);

            const PeriodResult = await sql.query`SELECT p.PeriodTypeID
                               , p.PeriodID
                               , p.PeriodDescription
                               , p.StartDate
                               , p.EndDate
                               , dateadd(day, 1, p.EndDate) as ActualEndDate
                               , p.AcceptedDate
                           FROM Periods p
                               WHERE p.PeriodTypeID = ${realTimeCommission[0].PeriodType}
                               AND p.PeriodID IN (${periodIds})
                               Order by p.PeriodID Desc`

            const periods = PeriodResult.recordset;

            realTimeCommission.forEach(function (data, index) {
                const period = periods.find(function (element) {
                    return (element.PeriodID === Number(data.PeriodID) && element.PeriodTypeID === Number(data.PeriodType))
                });

                if (period !== undefined) {
                    const periodData = {
                        PeriodID: period.PeriodID,
                        PeriodTypeID: period.PeriodTypeID,
                        PeriodDescription: period.PeriodDescription,
                        StartDate: period.StartDate,
                        EndDate: period.EndDate,
                        ActualEndDate: period.ActualEndDate
                    }
                    resultData.push(periodData);
                }
            })
            resData = resultData;
        }
        else {
            const errresult = await transform(response.body, errortemplate);
            resData = errresult.CustomerResult[0].faultstring
        }
        return resolve(resData);
    });
    return promise;
}

async function GetRealTimeCommissions() {
    const promise = new Promise(async (resolve, reject) => {
        var Commissions = [];

        var realTimeResponse = {
            Commissions: []
        };

        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': 'http://api.exigo.com/GetRealTimeCommissions',
        };

        const xml = `<soap:Envelope 
                               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Header>
                             <ApiAuthentication xmlns="http://api.exigo.com/">
                                <LoginName>chalkapi</LoginName>
                                <Password>5PhHK339B76k2eM8</Password>
                                <Company>chalkcouture</Company>
                             </ApiAuthentication>
                        </soap:Header>
                        <soap:Body>
                            <GetRealTimeCommissionsRequest xmlns="http://api.exigo.com/">
                                <CustomerID>967</CustomerID>
                            </GetRealTimeCommissionsRequest>
                        </soap:Body>
                    </soap:Envelope>`;

        const template = {
            CommissionsResult: ["//GetRealTimeCommissionsResult", {
                Result: ["//Result", {
                    Status: "Status",
                    Errors: "Errors",
                    TransactionKey: "TransactionKey"
                }],
                Commissions: ["//Commissions//CommissionResponse", {
                    CustomerID: "CustomerID",
                    PeriodType: "PeriodType",
                    PeriodID: "PeriodID",
                    PeriodDescription: "PeriodDescription",
                    CurrencyCode: "CurrencyCode",
                    CommissionTotal: "CommissionTotal",
                    Bonuses: ["//Bonuses//CommissionBonusResponse", {
                        Description: "Description",
                        Amount: "Amount",
                        BonusID: "BonusID"
                    }]
                }]
            }]
        };

        const errortemplate = {
            CustomerResult: ["//faultcode ", {
                faultstring: "//faultstring"
            }]
        };

        const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissions';

        const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
        const { body, statusCode } = response;
        const result = await transform(response.body, template);
        var resData = "";

        if (result.CommissionsResult.length > 0) {
            const commissionResult = result.CommissionsResult[0].Commissions;
            commissionResult.forEach(function (commissiondata, index) {
                var commission = {
                    CustomerID: null,
                    PeriodType: null,
                    PeriodID: null,
                    PeriodDescription: '',
                    CurrencyCode: '',
                    CommissionTotal: '',
                    Bonuses: []
                }

                commission.CustomerID = commissiondata.CustomerID;
                commission.PeriodType = commissiondata.PeriodType;
                commission.PeriodID = commissiondata.PeriodID;
                commission.PeriodDescription = commissiondata.PeriodDescription;
                commission.CurrencyCode = commissiondata.CurrencyCode;
                commission.CommissionTotal = commissiondata.CommissionTotal;
                var bonuses = commissiondata.Bonuses;
                bonuses.forEach(function (data, index) {
                    const bonus = {
                        Description: '',
                        Amount: null,
                        BonusID: null,
                    }
                    bonus.Description = data.Description;
                    bonus.Amount = data.Amount;
                    bonus.BonusID = data.BonusID;
                    commission.Bonuses.push(bonus);
                })
                realTimeResponse.Commissions.push(commission)
            })



            if (realTimeResponse.Commissions.length === 0) {
                const currentPeriodResult = await sql.query`SELECT p.PeriodTypeID
                                  , p.PeriodID
                                  , p.PeriodDescription
                                  , p.StartDate
                                  , p.EndDate
                                  , dateadd(day, 1, p.EndDate) as ActualEndDate
                                  , p.AcceptedDate
                             FROM Periods p
                                  WHERE p.PeriodTypeID = 1
                                  AND @CurrentDate between p.StartDate and dateadd(day, 1, p.EndDate)
                                  ORDER BY p.AcceptedDate desc, p.EndDate desc`

                const period = currentPeriodResult.recordset

                var commission = {
                    CustomerID: 967,
                    PeriodType: 1,
                    PeriodID: period.PeriodID,
                    PeriodDescription: '',
                    CurrencyCode: 'usd',
                    CommissionTotal: '',
                    Bonuses: []
                }
                realTimeResponse.Commissions.push(commission)
            }

            for (var i = 0; i < realTimeResponse.Commissions.length; i++) {
                var data = realTimeResponse.Commissions[i];
                var resultData = {
                    Commission: {},
                    Volume: {}
                }
                resultData.Commission = data
                const volumeResult = await sql.query`Select 
                               c.CustomerID			                        
                             , ModifiedDate = isnull(pv.ModifiedDate, '01/01/1900')
                             , Volume2 = isnull(pv.Volume2, 0)
                             , Volume5 = isnull(pv.Volume5, 0)
                             , Volume6 = isnull(pv.Volume6, 0)
                             , Volume7 = isnull(pv.Volume7, 0)
                             , Volume8 = isnull(pv.Volume8, 0)
                             , Volume9 = isnull(pv.Volume9, 0)
                             , PeriodID = p.PeriodID
                             , PeriodTypeID = p.PeriodTypeID
                             , PeriodDescription = p.PeriodDescription
                             , StartDate = p.StartDate
                             , EndDate = p.EndDate
                             , ActualEndDate = dateadd(day, 1, p.EndDate)
                             , RankID = isnull(pv.RankID,0)
                             , RankDescription = isnull(r.RankDescription, '')
                             , RankID = isnull(pv.PaidRankID,0)
                             , RankDescription = isnull(pr.RankDescription, '') 
                             , RankID = ISNULL((SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID),0)
                             , RankDescription = ISNULL((select RankDescription from Ranks where RankID = (SELECT  Max(pvr.PaidRankID) from PeriodVolumes pvr where pvr.CustomerID = pv.CustomerID  AND ((((pv.PeriodID - 1) / 3) * 3) + -2)  <= pvr.PeriodID AND  pv.PeriodID >= pvr.PeriodID)),'')
                         FROM Customers c
                             LEFT JOIN PeriodVolumes pv
                                  ON pv.CustomerID = c.CustomerID
                             LEFT JOIN Periods p
                                  ON pv.PeriodID = p.PeriodID
                                  AND pv.PeriodTypeID = p.PeriodTypeID
                             LEFT JOIN Ranks r
                                  ON r.RankID = c.RankID
                             LEFT JOIN Ranks pr
                                  ON pr.RankID = pv.PaidRankID
                             WHERE pv.CustomerID = 967
                                  AND p.PeriodTypeID = ${data.PeriodType}
                                  AND p.PeriodID =${data.PeriodID}`

                resultData.Volume = volumeResult.recordset[0]
                Commissions.push(resultData);
            }
            resData = Commissions;
        }
        else {
            const errresult = await transform(response.body, errortemplate);
            resData = errresult.CustomerResult[0].faultstring
        }
        return resolve(resData);
    });
    return promise;
}

async function GetRealTimeCommissionDetails(periodID) {
    const promise = new Promise(async (resolve, reject) => {
        var realTimeCommissionDetails = {
            DeferredCommission: [],
            SponsorBonus: [],
            CoachingBonus: [],
            CuturierBonus: []
        };

        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': 'http://api.exigo.com/GetRealTimeCommissions',
        };

        const xml = `<soap:Envelope 
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                                xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Header>
                               <ApiAuthentication xmlns="http://api.exigo.com/">
                                   <LoginName>chalkapi</LoginName>
                                   <Password>5PhHK339B76k2eM8</Password>
                                   <Company>chalkcouture</Company>
                                </ApiAuthentication>
                        </soap:Header>
                        <soap:Body>
                               <GetRealTimeCommissionsRequest xmlns="http://api.exigo.com/">
                                   <CustomerID>967</CustomerID>
                                   </GetRealTimeCommissionsRequest>
                        </soap:Body>
                    </soap:Envelope>`;

        const template = {
            CommissionsResult: ["//GetRealTimeCommissionsResult", {
                Result: ["//Result", {
                    Status: "Status",
                    Errors: "Errors",
                    TransactionKey: "TransactionKey"
                }],
                Commissions: ["//Commissions//CommissionResponse", {
                    CustomerID: "CustomerID",
                    PeriodType: "PeriodType",
                    PeriodID: "PeriodID",
                    PeriodDescription: "PeriodDescription",
                    CurrencyCode: "CurrencyCode",
                    CommissionTotal: "CommissionTotal",
                    Bonuses: ["//Bonuses//CommissionBonusResponse", {
                        Description: "Description",
                        Amount: "Amount",
                        BonusID: "BonusID"
                    }]
                }]
            }]
        };

        const errortemplate = {
            CustomerResult: ["//faultcode ", {
                faultstring: "//faultstring"

            }]
        };

        const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissions';

        const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
        const { body, statusCode } = response;
        const result = await transform(response.body, template);
        var resData = "";
        if (result.CommissionsResult.length > 0) {
            var realTimeCommission = [];
            const commissionResult = result.CommissionsResult[0].Commissions;
            commissionResult.forEach(function (commissiondata, index) {
                var commission = {
                    CustomerID: null,
                    PeriodType: null,
                    PeriodID: null,
                    PeriodDescription: '',
                    CurrencyCode: '',
                    CommissionTotal: '',
                    Bonuses: []
                }

                commission.CustomerID = commissiondata.CustomerID;
                commission.PeriodType = commissiondata.PeriodType;
                commission.PeriodID = commissiondata.PeriodID;
                commission.PeriodDescription = commissiondata.PeriodDescription;
                commission.CurrencyCode = commissiondata.CurrencyCode;
                commission.CommissionTotal = commissiondata.CommissionTotal;
                var bonuses = commissiondata.Bonuses;
                bonuses.forEach(function (data, index) {
                    const bonus = {
                        Description: '',
                        Amount: null,
                        BonusID: null,
                    }
                    bonus.Description = data.Description;
                    bonus.Amount = data.Amount;
                    bonus.BonusID = data.BonusID;
                    commission.Bonuses.push(bonus);
                })
                realTimeCommission.push(commission)
            })

            if (realTimeCommission.length > 0) {
                //const commissionsList = periodID > 0 ? realTimeCommission.filter(d => Number(d.PeriodID === periodID)) : realTimeCommission;
                const commissionsList = realTimeCommission.filter(d => Number(d.PeriodID) === periodID);
                if (commissionsList !== undefined) {
                    for (var i = 0; i < commissionsList.length; i++) {
                        var data = commissionsList[i]
                        for (var j = 0; j < data.Bonuses.length; j++) {
                            var bonusdata = data.Bonuses[j];
                            var cDetails = await ExigoRealTimeCommissionDetails(967, Number(data.PeriodType), Number(data.PeriodID), Number(bonusdata.BonusID))
                            switch (Number(bonusdata.BonusID)) {
                                case 1:
                                    cDetails.forEach(function (d1) {
                                        realTimeCommissionDetails.DeferredCommission.push(d1)
                                    })
                                    break;
                                case 5:
                                    cDetails.forEach(function (d5) {
                                        realTimeCommissionDetails.SponsorBonus.push(d5)
                                    })
                                    break;
                                case 6:
                                    cDetails.forEach(function (d6) {
                                        realTimeCommissionDetails.CoachingBonus.push(d6)
                                    })
                                    break;
                                case 7:
                                    cDetails.forEach(function (d7) {
                                        realTimeCommissionDetails.CuturierBonus.push(d7)
                                    })
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
            resData = realTimeCommissionDetails;
        }
        else {
            const errresult = await transform(response.body, errortemplate);
            resData = errresult.CustomerResult[0].faultstring
        }
        return resolve(resData);
    });
    return promise;
}

async function ExigoRealTimeCommissionDetails(cId, pTypeId, pId, bId) {
    const promise = new Promise(async (resolve, reject) => {
        const commissionDetails = [];
        const headers = {
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': 'http://api.exigo.com/GetRealTimeCommissionDetail',
        };

        const xml = `<soap:Envelope 
                             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                             xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                             xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                        <soap:Header>
                              <ApiAuthentication xmlns="http://api.exigo.com/">
                                    <LoginName>chalkapi</LoginName>
                                    <Password>5PhHK339B76k2eM8</Password>
                                    <Company>chalkcouture</Company>
                              </ApiAuthentication>
                        </soap:Header>
                        <soap:Body>
                              <GetRealTimeCommissionDetailRequest xmlns="http://api.exigo.com/">
                                     <CustomerID>${cId}</CustomerID>
                                     <PeriodType>${pTypeId}</PeriodType>
                                     <PeriodID>${pId}</PeriodID>
                                     <BonusID>${bId}</BonusID>
                              </GetRealTimeCommissionDetailRequest>
                        </soap:Body>
                    </soap:Envelope>`;

        const template = {
            CommissionDetailsResult: ["//GetRealTimeCommissionDetailResult", {
                Result: ["//Result", {
                    Status: "Status",
                    Errors: "Errors",
                    TransactionKey: "TransactionKey"
                }],
                CommissionDetails: ["//CommissionDetails//CommissionDetailResponse", {
                    FromCustomerID: "FromCustomerID",
                    FromCustomerName: "FromCustomerName",
                    OrderID: "OrderID",
                    Level: "Level",
                    PaidLevel: "PaidLevel",
                    SourceAmount: "SourceAmount",
                    Percentage: "Percentage",
                    CommissionAmount: "CommissionAmount"
                }]
            }]
        };

        const errortemplate = {
            CustomerResult: ["//faultcode ", {
                faultstring: "//faultstring"

            }]
        };

        const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=GetRealTimeCommissionDetail';

        const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 100000 });
        const { body, statusCode } = response;
        const result = await transform(response.body, template);
        var resData = "";

        if (result.CommissionDetailsResult.length > 0) {
            const commissionDetailsResult = result.CommissionDetailsResult[0].CommissionDetails;
            commissionDetailsResult.forEach(function (detail, index) {
                var commissionDetail = {
                    BonusID: bId,
                    FromCustomerID: detail.FromCustomerID,
                    FromCustomerName: detail.FromCustomerName,
                    OrderID: detail.OrderID,
                    Level: detail.Level,
                    PaidLevel: detail.PaidLevel,
                    SourceAmount: detail.SourceAmount,
                    Percentage: detail.Percentage,
                    CommissionAmount: detail.CommissionAmount
                }
                commissionDetails.push(commissionDetail)
            })
        }
        else {
            const errresult = await transform(response.body, errortemplate);
            resData = errresult.CustomerResult[0].faultstring
        }
        return resolve(commissionDetails);
    });
    return promise;
}








