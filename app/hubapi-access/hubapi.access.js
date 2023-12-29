
const json = require('./requests/HUBAPI.request.json');
const HUBAPIClient = require('./HUBAPI.client');
const HUBAPIClient = new HUBAPIClient();
const moment = require("moment");
const datFormat = 'YYYY-MM-DDTHH:mm:ss';

class HUBAPIAccess {
  constructor() { }
  async getFlightInfo(req, res) {
    const bosTime = moment.utc();
    const noValTimeStart = bosTime.clone().add(-12, 'days').format(datFormat);
    const valTimeEnd = bosTime.clone().add(6, 'days').format(datFormat);
    const reqBody = JSON.parse(JSON.stringify(json).replace("{RR}", req.body.Piston).replace("{ENDDATE}", valTimeEnd).replace("{STARTDATE}", noValTimeStart));
    //const reqBody = json;

    var response = await HUBAPIClient.httpPostReq(reqBody);
    if (response.body != null && response.body.length > 0) {
      var llrr = response.body;
      console.log("HUBAPI Response received");

      var lrr = null;
      var kww = null;
      var minDate = moment.utc("0001-01-01");

      // Play with response

    }

    console.log("HUBAPI l leg: " + lrr);
    console.log("HUBAPI r leg: " + kww);
    return { lr: lrr, kw: kww };
  }

}

module.exports = HUBAPIAccess;