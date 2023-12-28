//Dynatrace: START
try {
  require('@dynatrace/oneagent')({
    environmentid: process.env.environmentId,
    apitoken: process.env.apiToken,
    endpoint: process.env.endpoint // specify endpoint url - not needed for SaaS customers
  });
} catch (err) {
  console.log('Failed to load OneAgent: ', err);
}
//Dynatrace: END
const apiProvider = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc");
//const swaggerDocument = require('../swagger.json');
const jwt = require('express-jwt');
var jwtGenerate = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utilities/logger');
const sharedController = require('./api/shared.controller');

const jwksClient = require('jwks-rsa');
require('dotenv').config();
const OtsAccess = require('./dTat-access/shared.sql');
const jwt_decode = require('jwt-decode');
const moment = require("moment");

const app = apiProvider();
app.disable('x-powered-by');
app.use(cors());

const RR_TOKEN_SECURITY_KEY = process.env.RR_TOKEN_SECURITY_KEY;
const RR_TOKEN_AUDIENCE = process.env.RR_TOKEN_AUDIENCE || 'ppRTS';
const RR_TOKEN_ISSUER = process.env.RR_TOKEN_ISSUER;
const EPAAS_TOKEN_ISSUER = process.env.EPAAS_TOKEN_ISSUER;
const oAuth_TOKEN_JWKS_URI = process.env.oAuth_TOKEN_JWKS_URI;
const BQR_ALLOWED_SCOPES = ['BQR.read', 'BQR.write'];
const AZURE_AD_TENANT_ID = process.env.AZURE_TENANT_ID;
const LOG_AUTH = process.env.LOG_AUTH;
const AZURE_TP_APP_ID = process.env.AZURE_TP_APP_ID

app.use('/api/health', (req, res, next) => {
  res.status(200).send('ALLUP');
});


const wallIssuer = "https://wallview.ccaabb.com";
app.use('/wall-token', (req, res, next) => {
  const now = Math.round(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 2900,
    nbf: now,
    iss: wallIssuer,
    aud: [
      "https://abbcv.cc.gg.com"
    ]
  };
  const secret = process.env.RR_TOKEN_SECURITY_KEY;
  const token = jwtGenerate.sign(payload, secret);
  res.status(200).json({
    "token": token
  });
});
const epaasClient = jwksClient({
  jwksUri: `${EPAAS_TOKEN_ISSUER}/token_keys`,
  cache: true
});

const azureAdClient = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`,
  cache: true
});

const secretFn = (req, header, payload, done) => {
  try {
    // console.log("EPAAS_TOKEN_ISSUER === " + EPAAS_TOKEN_ISSUER);
    if (LOG_AUTH == 1) {
      console.log("Auth1: grant_type- " + payload.grant_type);
      console.log("Auth2: Header- " + header);
      if (header != null && header != undefined) {
        console.log("Auth3: Header kid- " + header.kid);
        console.log("Auth4: Header algo- " + header.alg);
      }
    }
    // oAuth federate validation
    if (oAuth_TOKEN_JWKS_URI.indexOf(payload.iss) > -1) {
      var authUrlArray = oAuth_TOKEN_JWKS_URI.split(',');
      var authUrl = '';
      for (var i = 0; i < authUrlArray.length; i++) {
        if (authUrlArray[i].indexOf(payload.iss) > -1) {
          authUrl = authUrlArray[i];
        }
      }

      if (LOG_AUTH == 1) {
        console.log("oAuth payload.iss === " + payload.iss);
      }
      var kid = header.kid;
      var jkwsUrl = authUrl + kid;
      const oAuthClient = jwksClient({
        jwksUri: jkwsUrl,
        cache: true
      });
      oAuthClient.getSigningKey(header.kid, (err, key) => {
        try {
          if (key == null) {
            throw ("'key' was null.");
          }
          const oAuthSigningKey = key.getPublicKey();
          done(null, oAuthSigningKey);
        }
        catch (ex) {
          console.error(ex);
          done(new jwt.UnauthorizedError('invalid_token', { message: `Unable to validate authentication.` }));
          // throw ex;
        }
      });
    }
    // Azure AD validation
    else if (payload.tid && payload.tid === AZURE_AD_TENANT_ID) {
      try {
        if (header != null && header != undefined) {
          azureAdClient.getSigningKey(header.kid, (err, key) => {
            const azureAdSigningKey = key.getPublicKey();
            const signingKey = key.publicKey || key.rsaPublicKey;
            done(null, signingKey);
          });
        }
      }
      catch (ex) {
        console.error(ex);
        done(new jwt.UnauthorizedError('invalid_token', { message: `Unable to validate authentication.` }));
        // throw ex;
      }
    }
    else if (payload.grant_type && payload.grant_type === 'client_credentials') {
      if (LOG_AUTH == 1) {
        console.log("External App1: payload scope- " + payload.scope);
        console.log("External App2: grant_type- " + payload.grant_type);
      }
      //Must be epaas token,so verify if the token includes one of expected scope      
      if (payload.scope.filter(value => BQR_ALLOWED_SCOPES.includes(value)).length === 0) {
        if (LOG_AUTH == 1) {
          console.log("External App3: Scope- " + `Invalid Scope ${payload.scope}`);
        }
        return done(new jwt.UnauthorizedError('invalid_token', { message: `Invalid Scope ${payload.scope}` }));
      }
      if (header != null && header != undefined) {
        epaasClient.getSigningKey(header.kid, (err, key) => {
          const ePaaSSigningKey = key.getPublicKey();
          if (LOG_AUTH == 1) {
            console.log("External App4: Key- " + key);
            console.log("External App5: Public Key- " + ePaaSSigningKey);
            console.log("External App6: Validation Done- " + payload.scope);
          }

          return done(null, ePaaSSigningKey);
        });
      }
    } else {
      const expectedIssuers = RR_TOKEN_ISSUER.split(',').map(s => s.trim());
      if (expectedIssuers.indexOf(payload.iss) > -1) {
        return done(null, RR_TOKEN_SECURITY_KEY);
      }
      done(new jwt.UnauthorizedError('invalid_token', { message: `Invalid Issuer ${payload.iss}` }));
    }
  }
  catch (error) {
    console.log("Authentication Error: " + error);
  }
};
const jwtValidator = jwt({
  secret: secretFn,
  credentialsRequired: true
});


if (RR_TOKEN_AUDIENCE != null) {
  app.use('/shared', jwtValidator);
}

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: '2.0.0',
      title: 'CQR BQR API',
    },
    basePath: '/',
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      servers: [
        {
          url: "http://localhost:4000",
        },
      ],
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [__dirname + '/app.js',
  __dirname + '/api/*.js']
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(__dirname + '/app.js');
console.log(swaggerDocs);

app.get('/docs.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
const swaggerDocument = require('../swagger.json');
const swaggerDocExternal = require('../swagger-external.json');
//app.use('/docs-external', swaggerUi.setup(swaggerDocExternal));
//app.use('/docs', swaggerUi.setup(swaggerDocument));

function validateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];;
  if (token == null) res.sendStatus(400).send("Access token not present");

  var decoded = jwt_decode(token);
  if (AZURE_AD_TENANT_ID.includes(decoded.tid)) {
    if (AZURE_TP_APP_ID.includes(decoded.appid)) {
      if (new Date(decoded.exp * 1000) > new Date()) {
        next();
      } else {
        res.status(401).send("Token expired");
      }
    }
    else {
      res.status(403).send("User doesn't have privilege for this resource");
    }
  }
  else {
    res.status(401).send("Invalid Token");
  }
}

//AZURE AD Validation for specific endpoints (optional)
// app.use('/ft', validateToken); imagine ft is a controller for Azure AD validation

app.use("/docs", swaggerUi.serve, (...args) => swaggerUi.setup(swaggerDocument)(...args));
app.use("/docs-external", swaggerUi.serve, (...args) => swaggerUi.setup(swaggerDocExternal)(...args));

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/shared', sharedController);
app.get('/', function (req, res) {
  res.status(200).send('BQR API');
});
app.use(function (req, res, next) {
  console.error('404 page requested');
  res.status(404).send('This page does not exist!');
});

module.exports = app;
