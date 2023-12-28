require('dotenv').config();
const KeyvaultAccess = require('./keyvault.access');
const keyvaultAccess = new KeyvaultAccess();

const getDBConfig = async ()=> {   
    const secrets = await keyvaultAccess.getSecrets();
    const server = secrets.DbServer.substring(0, secrets.DbServer.indexOf(','));

    const options = {
        port: 1433,
        encrypt: true,
        rowCollectionOnRequestCompletion: true,
        useColumnNames: false,
        dTatbase: secrets.DbName,
        enableArithAbort: true,
        trustServerCertificate: true,
        validateBulkLoadParameters: true
    };

    const authentication = {
        type: "default",
        options: {
            userName: secrets.DbUsername,
            password: secrets.DbPassword
        }
    };

    const configuration = {
        server: server,
        options: options,
        authentication: authentication
    };

    return configuration;
}

module.exports = { getDBConfig };
