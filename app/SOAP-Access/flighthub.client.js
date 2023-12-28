const soap = require('soap');
const json = require('./requests/soap.request.json');
const flUN = process.env.HUB1_UN;
const flPW = process.env.HUB1_PW;
const HUB1Client = process.env.HUB1_ENV || 'OPS';

class HUB1lient {
    constructor() { }
    callHUB1(requestBody, root) {

        var options = json.Option

        return new Promise((resolve, reject) => {
            soap.createClient(__dirname + "/wsdl/" + json.WSDL, options, function (err, client) {
                if (err) {
                    console.log('HUB1 client create error: ' + err);
                    reject({ error: true });
                }
                client.wsdl.definitions.xmlns.mes = json.Mes;
                client.wsdl.definitions.xmlns.soap = json.Soap;
                client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();

                const requestContextHeader = json.RequestHeader;
                requestContextHeader.ClientID = HUB1Client;

                client.setEndpoint(process.env.HUB1_ENDPOINT);
                const requestSecurityHeader = JSON.parse(
                    JSON.stringify(json.Header).
                        replace("flUN", flUN).
                        replace("flPW", flPW));

                client.addSoapHeader(requestSecurityHeader);
                client.addSoapHeader({
                    'soap:RequestContextHeader':
                        requestContextHeader
                });

                var args = {
                    _xml:
                        requestBody
                };

                client.getLLRRByTatNumber(args, function (err, result) {
                    if (err) {
                        console.log('HUB1: ' + err);
                        reject({ error: true });
                        console.log("HUB1 Error:"+ error);
                    }
                    resolve({ message: result });
                });
            });
        }).catch(error => {
            console.log(error);
        });
    }
}

module.exports = HUB1lient;
