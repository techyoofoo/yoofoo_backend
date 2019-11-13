import sql from 'mssql';
import soapRequest from 'easy-soap-request';
import { transform, prettyPrint } from 'camaro';

export const getSummaryCommissions = function (customerID) {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const summaryCommissionResult = await sql.query`  SELECT
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
                                      WHERE designerid = ${customerID}
                                      ORDER BY p.StartDate DESC`

            var resData = summaryCommissionResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getCommissionPeriod = function () {
    const promise = new Promise(async (resolve, reject) => {
        try {
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
            var resData = commissionPeriodResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getCurrentPeriod = function () {
    const promise = new Promise(async (resolve, reject) => {
        try {
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
            var resData = currentPeriodResult.recordset[0]
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getPeriods = function (periodTypeID, periodID) {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const periodResult = await sql.query`SELECT p.PeriodTypeID
                                       , p.PeriodID
                                       , p.PeriodDescription
                                       , p.StartDate
                                       , p.EndDate
                                       , dateadd(day, 1, p.EndDate) as ActualEndDate
                                       , p.AcceptedDate
                                 FROM Periods p
                                      WHERE p.PeriodTypeID = ${periodTypeID}
                                      AND p.PeriodID = ${periodID}
                                      Order by p.PeriodID Desc`
            var resData = periodResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getHistoricalCommissions = function (customerID, CommissionRunID) {
    const promise = new Promise(async (resolve, reject) => {
        try {
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
                                         WHERE c.CustomerID = ${customerID}
                                              AND c.CommissionRunID = ${CommissionRunID}
                                         ORDER BY cr.periodid DESC`

            var resData = historicalCommissionResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getVolumes = function (customerID, periodTypeID, periodID) {
    const promise = new Promise(async (resolve, reject) => {
        try {
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
                                             WHERE pv.CustomerID = ${customerID}
                                                   AND p.PeriodTypeID = ${periodTypeID}
                                                   AND p.PeriodID =${periodID}`

            var resData = volumeResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}



export const getHistoricalBonusDetails = function (customerID, commissionRunID) {
    const promise = new Promise(async (resolve, reject) => {
        try {
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
                                         cd.CustomerID = ${customerID}
                                         AND cd.CommissionRunID = ${commissionRunID}`

            var resData = historicalBonusDetailsResult.recordset
            return resolve(resData);
        }
        catch (error) {
            sql.close()
            throw err
        }
    });
    return promise;
}


export const getRealTimePeriods = function () {
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


export const getRealTimeCommissions = function () {
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

export const getRealTimeCommissionDetails = function (periodID) {
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
                            var cDetails = await exigoRealTimeCommissionDetails(967, Number(data.PeriodType), Number(data.PeriodID), Number(bonusdata.BonusID))
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

export const exigoRealTimeCommissionDetails = function (cId, pTypeId, pId, bId) {
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