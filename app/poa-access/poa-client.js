const request = require('request');
const POADOMAIN = process.env.POADOMAIN;
const POAAUTH_URL = process.env.POAAUTH_URL;
const POAGRANT_TYPE = process.env.POAGRANT_TYPE;
const POACLIENT_ID = process.env.POACLIENT_ID;
const POACLIENT_SECRET = process.env.POACLIENT_SECRET;

class SoaClient {
  constructor() {
    this.expiresAt = null;
    this.token = null;
  }

  getBaseUrl(){
    return `https://tpoa-${prefix}-${POADOMAIN}${queryPath}?${queryString}`;
  }
  // params is a JSON object with key and value pairs for the queries you want to pass along
  // the prefix is what preceeds the soa domain, see examples of usage above
  async httpGetReq(prefix, queryPath, params) {
    // Before hitting SOA, make sure our token is up to date
    await this.updateToken();
    // Convert the JSON formatted params into a query string
    Object.keys(params).forEach(key => (params[key] == null ? delete params[key] : ''));
    const keys = Object.keys(params);
    let queryString = '';
    for (let i = 0; i < keys.length; i++) {
      queryString += `${keys[i]}=${params[keys[i]]}`;
      if (i + 1 < keys.length) {
        queryString += '&';
      }
    }
      return new Promise((resolve, reject) => {
       
        request.get(
          `${getBaseUrl()}`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          },
          (err, resp, body) => {
            if (!err) {
              resolve({ code: resp.statusCode, body: JSON.parse(body) });
            } else {
              reject({ code: 500, body: err });
            }
          }
        );
      });
    
  }

  async updateToken() {
    // Only update the token if it's expired
    if (!this.expiresAt || Date.now() >= this.expiresAt) {
      let response = await this.getAuthToken();
      this.expiresAt = Date.now() + response.body['expires_in'] * 1000;
      this.token = response.body['access_token'];
    }
  }

  getUrl(){
    return POAAUTH_URL;
  }
  getAuthToken() {
    
    return new Promise((resolve, reject) => {
      request.post(
        `${getUrl()}`,
        {
          form: {
            grant_type: POAGRANT_TYPE,
            client_id: POACLIENT_ID,
            client_secret: POACLIENT_SECRET
          }
        },
        function(err, resp, body) {
          if (!err) {
            resolve({ code: resp.statusCode, body: JSON.parse(body) });
          } else {
            reject({ code: 500, body: err });
          }
        }
      );
    });
  }
}

module.exports = SoaClient;
