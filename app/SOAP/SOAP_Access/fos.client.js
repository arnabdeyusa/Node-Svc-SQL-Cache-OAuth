const soap = require('soap');
const logger = require('./../../utilities/logger');



class SOSSoapClient {
    constructor() { }
    executeSOSCommand(requestBody, requestContextHeader, root) {

        var options = {
            'attributesKey': "$attributes",
            'namespaceArrayElements': false,
            'wsdl_options': {
            'fixedPath': true
            },
            stream: true,
            envelopeKey: root
        };

        // if (url === undefined)
        //     url = 'http://SOSservice-qa.qcorpaa.aa.com/V2/SOSService.svc?wsdl';

        return new Promise((resolve, reject) => {
            soap.createClient(__dirname+"/service.wsdl", options, function (err, client) {
                if (err) {
                    reject({ error: true });
                }
                client.wsdl.definitions.xmlns.SOS = process.env.SOS_SCHEMA_SOS;
                client.wsdl.definitions.xmlns.aa = process.env.SOS_SCHEMA_AA;
                client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();

                client.addSoapHeader({
                    attributes: {
                        'xmlns': process.env.SOS_SCHEMA_SOS
                    }, 'SOS:RequestContextHeader': requestContextHeader
                });

                // if (process.env.DB_ENV != 'lab') {
                client.setEndpoint(process.env.SOS_ENDPOINT);
                var wsSecurity = new soap.WSSecurity(process.env.EPOAUN, process.env.EPOAPW, {
                    hasNonce: true, hasTokenCreated: true, passwordType: 'PasswordText', hasTimeStamp: true, mustUnderstand: false
                });

                client.setSecurity(wsSecurity);
                //}

                var args = {
                    _xml:
                        requestBody
                };
                
                //console.log(requestBody);
                client.Execute(args, function (err, result) {
                    if (err) {
                       console.log("SOS Service Fail Response"+err);
                       reject("SOS Service Fail Response"+err);
                    }
                    console.log("SOS Service Response"+result);
                    resolve({ message: result });
                });
            });
        }).catch(error=>{
            console.log(error);
        });
    }
}

module.exports = SOSSoapClient;
