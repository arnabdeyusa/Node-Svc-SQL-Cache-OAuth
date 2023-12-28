//put this in a module.
const tedious = require('tedious');
const Connection = tedious.Connection;
const Request = tedious.Request;
const constant = require('./db.constants');
const dbConfig = require('./db.config');
const logger = require('./../../utilities/logger');

class DTatAccess {
    constructor() {
        this.dbType = process.env.DB_TYPE;
        this.executeQuery = this.executeSQLQuery;
    }

    async create(query, queryParams) {
        // scope for specific task on insert
        return await this.executeQuery(query, queryParams);
    }

    async read(query, queryParams) {
        // scope for specific task on select      
        return await this.executeQuery(query, queryParams);
    }

    async update(query, queryParams) {
        // scope for specific task on update
        return await this.executeQuery(query, queryParams);
    }

    async delete(query, queryParams) {
        // scope for specific task on delete
        return await this.executeQuery(query, queryParams);
    }

   async executeSQLQuery(query, queryParams) {  
        var config, connection;
        config = await dbConfig.getDBConfig();
        connection = new Connection(config);

        return new Promise((resolve, reject) => {
            var request = new Request(query, (err, rowCount, rows) => {
                if (err) {
                    console.error('SQL Error: ' + err.message);
                    connection.close();
                    var message = constant.getErrorMessage(query);
                    if (message == null)
                        message = err.message;
                    reject({ message: message, code: 500 });
                } else {
                    connection.close();
                    if (rows.length > 0)
                        resolve({ message: rows, code: 200 });
                    else
                        resolve({ message: constant.getMessage(query), code: 200 });
                }
            });

            if (queryParams)
                queryParams.forEach((param) => {
                    request.addParameter(param.name, param.type, param.value);
                });

            connection.connect((error) => {
                if (error) {
                    var errorKeys = Object.keys(error);
                    for (var i = 0, len = errorKeys.length, errorKey; i < len; ++i) {
                        errorKey = errorKeys[i]
                        console.error("SQL ERROR >> " + errorKey);
                        console.error(error[errorKey]);
                    }
                    console.error('SQL connection error: ' + error.message);
                    reject({ message: 'SQL connection error', code: 500 });
                }
                connection.execSql(request);
                
            });
        }).catch(error=>{
            console.log(error);
        });
    }

    executeNoSQLQuery(query, res) {
        // implement when required
    }
}

module.exports = DTatAccess;
