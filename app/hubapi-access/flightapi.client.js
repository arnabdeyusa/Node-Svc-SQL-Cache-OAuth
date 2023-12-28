const request = require('request');
const KeyvaultAccess = require('../dTat-access/common/keyvault.access');
const keyvaultAccess = new KeyvaultAccess();
const tokenUrl = process.env.HUBAPI_TOKEN;
const baseUrl = process.env.HUBAPI_ENDPOINT;
const clientId = process.env.HUBAPI_CLIENID;

let HUBAPIUN, HUBAPIPW;
class HUBAPIClient {
  constructor() {
    this.expiresAt = null;
    this.token = null;
  }
  getPostEndPoint(){
    return baseUrl;
   }
  async httpPostReq(params) {
    const secrets =await keyvaultAccess.getSecrets();
    const certPfx = secrets.HUBAPICertificate;
    HUBAPIUN = secrets.HUBAPIUN;
    HUBAPIPW = secrets.HUBAPIPW;
    await this.updateToken();
    
      return new Promise((resolve, reject) => {        
        request.post(
          getPostEndPoint(),
          {
            json: params,
            headers: {
              "Content-Type":"application/json",
              Authorization: `Bearer ${this.token}`,
              ClientID: clientId
            },            
            pfx: Buffer.from(certPfx, "base64")
          },
          (err, resp, body) => {
            if (!err) {
              resolve({ code: resp.statusCode, body: body });
            } else {
              reject({ code: 500, body: err });
            }
          }
        );
      });
    }
  

  async updateToken() {
    if (!this.expiresAt || Date.now() >= this.expiresAt) {
      let response = await this.getAccessToken();
      const body = JSON.parse(response);
      this.expiresAt = Date.now() + body['expires_in'] * 1000;
      this.token = body['access_token'];
    }
  }
 getEndPoint(){
  return tokenUrl;
 }
  getAccessToken() {
    return new Promise((resolve, reject) => {
      const options = {
        url: getEndPoint(),
        method: 'POST',
        auth: {
          user: HUBAPIUN,
          pass: HUBAPIPW,
        },
        form: {
          grant_type: "client_credentials",
        },
      };

      request(options, (error, response, body) => {
        if (error) return reject(error);
        return resolve(body);
      });
    });
  }
}

module.exports = HUBAPIClient;
