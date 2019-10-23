import sql from 'mssql';

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
            WHERE 
                pv.CustomerID = @CustomerId
                AND pv.PeriodTypeId = 1
                AND p.EndDate BETWEEN '2019-04-17' AND DATEADD(hh, -24, '2019-10-17')`,
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
        RealTimeCommissions: {},
        HistoricalBonusDetails: [],
        Volumes: {}
    }

    return new Promise(async (resolve, reject) => {

        try {
            await sql.connect(config)
            const periodResult = await sql.query` SELECT p.PeriodTypeID
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
            if (period != undefined && period.StartDate < date) {

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
                sql.close()
                return resolve(reply.response(data).code(200));
            }

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
          ,Volume2 = isnull(pv.Volume2, 0)
          ,Volume5 = isnull(pv.Volume5, 0)
          ,Volume6 = isnull(pv.Volume6, 0)
          ,Volume7 = isnull(pv.Volume7, 0)
          ,Volume8 = isnull(pv.Volume8, 0)
          ,Volume9 = isnull(pv.Volume9, 0)
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
        FROM
          CommissionDetails cd	
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
            data.HistoricalBonusDetails = historicalBonusDetailsResult.recordset
            sql.close()
            resolve(reply.response(data).code(200));
        }
        catch (err) {
            sql.close()
            throw err
        }
    });
}




