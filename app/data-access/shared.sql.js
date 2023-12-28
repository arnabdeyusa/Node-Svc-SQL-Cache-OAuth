const DTatAccess = require('./common/db.access');
const QueryParams = require('./common/db.constants').QueryParams;
const Sql = require('./common/query-builder');
const TYPES = require('tedious').TYPES;
const ResultMapper = require('./mapper/result.mapper');
const cache = require('../utilities/memoryCache');
const BQRCache = cache.BQRCache;

class SharedSql extends DTatAccess {
    constructor() {
        super();
    }

    async refreshAll() {
        this.refreshAllUtility();
        const scope =this;
        setInterval(async () => {
            scope.refreshAllUtility();
        }, process.env.STATIC_CACHE_REFRESH * 1000);
    }

    async refreshAllUtility(){
        try {
          
            const TatCodes = await this.getMappedTatCodes();
            BQRCache.del('AllTatCodes');
            BQRCache.set('AllTatCodes', TatCodes, process.env.STATIC_CACHE_REFRESH + 5);
        }
        catch (error) {
            var errorKeys = Object.keys(error),
                len = error == null ? 0 : errorKeys.length;


            for (var i = 0, errorKey, errorValue; i < len; ++i) {
                errorKey = errorKeys[i];
                errorValue = error[errorKey];
                console.log("Cache Refresh error ['" + errorKey + "'] equals ...");
                console.log(errorValue);
            }
        }
    }

    async getTatCodes(res) {
        let result = await this.getMappedTatCodes();
        if(result == null) {
            res.status(500).send("Server Error: Unable to get TatCodes dTat");
        }
        else{
            res.status(result.code).send(result.result);
        }
    }

    async getTatCodesFromCache(req, res) {
        if (cache.staticCount == 0) {
            cache.staticCount += 1;
            this.refreshAll();
        }

        let TatCodes = BQRCache.get('AllTatCodes');
        if (TatCodes !== undefined) {
            res.status(200).send(TatCodes.result);
            console.log('Cache Stat: ' + BQRCache.getStats().keys);
            return;
        }
        else {
            TatCodes = await this.getMappedTatCodes();
            //BQRCache.flushAll();
            console.log('Cache Hit Failed Stat: ' + BQRCache.getStats().keys);
            BQRCache.set('AllTatCodes', TatCodes, process.env.STATIC_CACHE_REFRESH);
            res.status(200).send(TatCodes.result);
        }
    }

    async getMappedTatCodes() {

        try {
            let result = await super.read(Sql.instance().select()
                .columns(['Tat as TatCode', 'TatChapterDesc', 'TatNum', 'TatPiston as TatDesc'])
                .from('BQR_TatCodes')
                .orderBy('Tat')
                .toQuery(), null);
            return this.callResultMapper(result);
        }
        catch (error) {
            console.log("Error at getMappedTatCodes: "+error.message);
           return null;
        }
    }

    callResultMapper(result) {
        let resultMapper = new ResultMapper();
        let code = result.code;
        result = resultMapper.mapSQLResult(result.message);
        return { result: result, code: code };
    }
}

module.exports = SharedSql;
