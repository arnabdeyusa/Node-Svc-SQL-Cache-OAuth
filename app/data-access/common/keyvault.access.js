const creden = require("@azure/identity");
var sClient = require("@azure/keyvault-secrets");
const credential = new creden.DefaultAzureCredential();
const cache = require('../../utilities/memoryCache');
const BQRCache = cache.BQRCache;

class KeyvaultAccess {
    async getSecrets() {   
        let getDbName = BQRCache.get('DbName'); 
        let getServerName = BQRCache.get('DbServer');
        let getDbUserName = BQRCache.get('DbUserName');
        let getDbPassword = BQRCache.get('DbPassword');
        let HUBAPICertificate = BQRCache.get('HUBAPICertificate');
        let HUBAPIUN = BQRCache.get('HUBAPIUN');
        let HUBAPIPW = BQRCache.get('HUBAPIPW');

        if(getDbName == undefined || getServerName == undefined ||
            getDbUserName == undefined || getDbPassword == undefined || 
            HUBAPICertificate == undefined || HUBAPIUN == undefined || HUBAPIPW == undefined) {
        const vaultName = process.env.VAULT_NAME;
        const client = new sClient.SecretClient(`https://${vaultName}.vault.azure.net/`, credential);
        HUBAPICertificate = (await client.getSecret('HUBAPI-pfx')).value;
        HUBAPIUN = (await client.getSecret('HUBAPI-un')).value;
        HUBAPIPW = (await client.getSecret('HUBAPI-pw')).value;
    
        getServerName = (await client.getSecret('BBsMasterServer')).value;
        getDbName = (await client.getSecret('AosMasterDB')).value;
        getDbUserName = (await client.getSecret('AosMasterUser')).value;
        getDbPassword = (await client.getSecret('AosMasterPwd')).value;
    

        BQRCache.set('HUBAPICertificate', HUBAPICertificate);
        BQRCache.set('HUBAPIUN', HUBAPIUN);
        BQRCache.set('HUBAPIPW', HUBAPIPW);

        BQRCache.set('DbServer', getServerName);
        BQRCache.set('DbName', getDbName);
        BQRCache.set('DbUserName', getDbUserName);
        BQRCache.set('DbPassword', getDbPassword);
            }

        const secrets = {
            DbUsername: getDbUserName,
            DbName: getDbName,
            DbPassword: getDbPassword,
            DbServer: getServerName,
            HUBAPICertificate: HUBAPICertificate,
            HUBAPIUN: HUBAPIUN,
            HUBAPIPW: HUBAPIPW
        };

        return secrets;
        }
}

module.exports = KeyvaultAccess;

