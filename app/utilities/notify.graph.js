const client = require('@microsoft/microsoft-graph-client');
const creden = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
require('isomorphic-fetch');
const TokenCredentialAuthenticationProvider = graph.TokenCredentialAuthenticationProvider;
const ClientSecretCredential = creden.ClientSecretCredential;
const Client = client.Client;

class NotifyGraph {
    async sendMail(mail) {
        const SP_CLIENT_ID = process.env.AZURE_CLIENT_ID;
        const AAD_TENANT_ID = process.env.AZURE_TENANT_ID;
        const SP_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
        const USER_OBJECT_ID = process.env.FA_OBJECT_ID;
        
        const tokenCredential = new ClientSecretCredential(
          AAD_TENANT_ID,
          SP_CLIENT_ID,
          SP_CLIENT_SECRET
        );
      
        const scopes =["https://graph.microsoft.com/.default"];
        const options  = {
          scopes: scopes
        };
        const authProvider = new TokenCredentialAuthenticationProvider(
          tokenCredential,
          options
        );
        const client = Client.initWithMiddleware({
          debugLogging: true,
          authProvider,
      
        });
      
        await client.api(`/users/${USER_OBJECT_ID}/sendMail`).post({ message: mail });
      }
}

module.exports = NotifyGraph;