'use strict';
import {signIn,welcome} from "./handlers";

const Hapi = require('@hapi/hapi');
const { transform, prettyPrint } = require('camaro');


const soapRequest = require('easy-soap-request');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ["*"],
              headers: ["Accept", "Content-Type"],
              additionalHeaders: ["X-Requested-With"]
            }
          }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello World!';
        }
    });
    server.route({
        method: 'POST',
        path: '/rogue/yoofoo/usermodeule/authenticate',
        handler: function (request, h) {

            const req = request.payload.data;
            const promise = new Promise((resolve, reject) => {


                const headers = {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'soapAction': 'http://api.exigo.com/AuthenticateCustomer',
                };

                const xml = `<soap:Envelope 
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                  <soap:Header>
                  <ApiAuthentication xmlns="http://api.exigo.com/">
                  <LoginName>`+ req.ApiAuthentication.LoginName + `</LoginName>
                  <Password>`+ req.ApiAuthentication.Password + `</Password>
                  <Company>`+ req.ApiAuthentication.Company + `</Company>
                  </ApiAuthentication>
                  </soap:Header>
                  <soap:Body>
                  <AuthenticateCustomerRequest xmlns="http://api.exigo.com/">
                  <LoginName>`+ req.AuthenticateCustomerRequest.LoginName + `</LoginName>
                  <Password>`+ req.AuthenticateCustomerRequest.Password + `</Password>
                  </AuthenticateCustomerRequest>
                  </soap:Body>
                  </soap:Envelope>`;

                const template = {
                    CustomerResult: ["//AuthenticateCustomerResult", {
                        Result: ["//Result", {
                            Status: "Status",
                            Errors: "Errors",
                            TransactionKey: "TransactionKey"
                        }],
                        CustomerID: "CustomerID",
                        FirstName: "FirstName",
                        LastName: "LastName"
                    }]
                };
                const errortemplate = {
                    CustomerResult: ["//faultcode ", {
                            faultstring:"//faultstring"

                    }]
                };
                const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=AuthenticateCustomer';
                async function makeRequest() {
                    const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 });
                    const { body, statusCode } = response;
                    const result = await transform(response.body, template);
                    var resData="";
                    if (result.CustomerResult.length > 0) {
                        var token = signIn({ "username": result.CustomerResult[0].FirstName });
                        // resData = {"userData":result.CustomerResult[0],
                        //             "token":token};
                        //const decoded = welcome({"token":token});
                        resData = { "token": token };
                    }
                    else{
                        const errresult = await transform(response.body, errortemplate);
                        resData =errresult.CustomerResult[0].faultstring
                    }
                    resolve({ Message: resData });
                };
                makeRequest();
            });
            return promise;
        }
    });
    server.route({
        method: 'POST',
        path: '/rogue/yoofoo/usermodeule/register',
        handler: function (request, h) {

            const req = request.payload.data;
            const promise = new Promise((resolve, reject) => {
                

                const headers = {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'soapAction': 'http://api.exigo.com/CreateCustomer',
                };
                //const xml = creaetXMLData(req);
                const xml = `<soap:Envelope 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                <soap:Header>
                <ApiAuthentication xmlns="http://api.exigo.com/">
                <LoginName>`+ req.ApiAuthentication.LoginName + `</LoginName>
                <Password>`+ req.ApiAuthentication.Password + `</Password>
                <Company>`+ req.ApiAuthentication.Company + `</Company>
                </ApiAuthentication>
                </soap:Header>
                <soap:Body>
                <CreateCustomerRequest xmlns="http://api.exigo.com/">
                <FirstName>`+ req.User.FirstName + `</FirstName>
                <LastName>`+ req.User.LastName + `</LastName>
                <CustomerType>`+ req.User.CustomerType + `</CustomerType>
                <CustomerStatus>`+ req.User.CustomerStatus + `</CustomerStatus>
                <Email>`+ req.User.Email + `</Email>
                <CanLogin>`+ req.User.CanLogin + `</CanLogin>
                <LoginName>`+ req.User.LoginName + `</LoginName>
                <LoginPassword>`+ req.User.LoginPassword + `</LoginPassword>
                <CurrencyCode>`+ req.User.CurrencyCode + `</CurrencyCode>
                <LanguageID>`+ req.User.LanguageID + `</LanguageID>
      
                  </CreateCustomerRequest>
                  </soap:Body>
                  </soap:Envelope>`;

                const template = {
                    CustomerResult: ["//CreateCustomerResult ", {
                        Result: ["//Result", {
                            Status: "Status",
                            Errors: "Errors",
                            TransactionKey: "TransactionKey"
                        }],
                        CustomerID: "CustomerID",
                        CustomerKey: "CustomerKey"
                    }]
                };
                const errortemplate = {
                    CustomerResult: ["//faultcode ", {
                            faultstring:"//faultstring"

                    }]
                };
                const url = 'http://sandboxapi3.exigo.com/3.0/ExigoApi.asmx?WSDL?op=CreateCustomer';
                async function makeRequest() {
                    const { response } = await soapRequest({ url: url, headers: headers, xml: xml, timeout: 10000 });
                    const { body, statusCode } = response;
                    const result = await transform(response.body, template);
                    var resData="";
                    if(result.CustomerResult.length>0)
                    {
                        resData = result.CustomerResult[0];
                    }
                    else{
                        const errresult = await transform(response.body, errortemplate);
                        resData =errresult.CustomerResult[0].faultstring
                    }
                    resolve({ Message: resData });
                };
                makeRequest();
            });
            return promise;
        }
    });
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();