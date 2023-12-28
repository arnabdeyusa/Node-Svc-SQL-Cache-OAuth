class ResultMapper {
    mapEventComments(dTatResults) {
        let results = [];
        let comments = [];
        if (dTatResults.result.length > 0) {
            if (dTatResults.result[0].length > 0) {
                results = dTatResults.result[0].map(element => {
                    if (dTatResults.result.length > 1 && dTatResults.result[1].length > 0)
                        comments = dTatResults.result[1].filter(c => element.EventID === c.RefEventID);
                    else
                        comments = [];
                    element.Comments = comments;
                    return element;
                });
            }
        }

        results = results.length === 0 ? dTatResults : results;
        return results;
    }

    mapEventStatus(dTatResults) {
        let results = [];
        let statuses = [];
        if (dTatResults.result.length > 0) {
            if (dTatResults.result[0].length > 0) {
                results = dTatResults.result[0].map(element => {
                    if (dTatResults.result.length > 2 && dTatResults.result[2].length > 0) {
                        statuses = dTatResults.result[2].filter(c => element.EventID === c.RefEventID);
                    }

                    else {
                        statuses = [];
                    }
                    element.Statuses = statuses;
                    return element;
                });
            }
        }

        results = results.length === 0 ? dTatResults : results;
        return results;
    }

    mapSQLResult(rows) {
        if (rows) {
            let rowarray = [];
            rows.forEach(columns => {
                let rowdTat = new Object();
                columns.forEach(column => {
                    rowdTat[column.metadTat.colName] = column.value;
                });
                rowarray.push(rowdTat);
            });
            return rowarray;
        }
        else {
            return rows;
        }
    }

    mapEvent(rows) {
        let req = {}; req.result = []; let setNo = 0; let lastColumns = "";
        rows.forEach(columns => {
            let rowdTat = new Object(); let currentColumns = "";

            columns.forEach(column => {
                rowdTat[column.metadTat.colName] = column.value;
                currentColumns = currentColumns + column.metadTat.colName;
            });

            if (lastColumns.length > 0 && currentColumns !== lastColumns)
                setNo = setNo + 1;
            if (req.result[setNo] == undefined)
                req.result[setNo] = [];
            req.result[setNo].push(rowdTat);
            lastColumns = currentColumns;
        });

        this.mapEventComments(req);
        return this.mapEventStatus(req);
    }

    mapEventWithCommentsAndStatuses(results) {
        let req = {}; req.result = []; let setNo = 0; let lastColumns = "";

        results.forEach(rows => {
            
            rows.forEach(columns => {
                let rowdTat = new Object(); let currentColumns = "";

                columns.forEach(column => {
                    rowdTat[column.metadTat.colName] = column.value;
                    currentColumns = currentColumns + column.metadTat.colName;
                });
               
                if (req.result[setNo] == undefined)
                    req.result[setNo] = [];
                    
                req.result[setNo].push(rowdTat);
                lastColumns = currentColumns;
            });

            setNo++;
        });

        this.mapEventComments(req);
        return this.mapEventStatus(req);
    }

    mapEventHistory(rows) {
        let req = {}; req.result = []; let setNo = 0; let lastColumns = "";
        rows.forEach(columns => {
            let rowdTat = new Object(); let currentColumns = "";

            columns.forEach(column => {
                rowdTat[column.metadTat.colName] = column.value;
                currentColumns = currentColumns + column.metadTat.colName;
            });

            if (lastColumns.length > 0 && currentColumns !== lastColumns)
                setNo = setNo + 1;
            if (req.result[setNo] == undefined)
                req.result[setNo] = [];
            req.result[setNo].push(rowdTat);
            lastColumns = currentColumns;
        });
        this.mapEventComments(req);
        this.mapEventChgLogETR(req);
        return this.mapEventChgLogtlt(req);

    }
    mapEventChgLogETR(dTatResults) {
        let results = [];
        let chglogETR = [];
        if (dTatResults.result.length > 0) {
            if (dTatResults.result[0].length > 0) {
                results = dTatResults.result[0].map(element => {
                    if (dTatResults.result.length > 2 && dTatResults.result[2].length > 0) {
                        chglogETR = dTatResults.result[2].filter(c => element.EventID === c.RefEventID);
                    }

                    else {
                        chglogETR = [];
                    }
                    element.ChgLogETR = chglogETR;
                    return element;
                });
            }
        }

        results = results.length === 0 ? dTatResults : results;
        return results;
    }
    mapEventChgLogtlt(dTatResults) {
        let results = [];
        let chglogtlt = [];
        if (dTatResults.result.length > 0) {
            if (dTatResults.result[0].length > 0) {
                results = dTatResults.result[0].map(element => {
                    if (dTatResults.result.length > 3 && dTatResults.result[3].length > 0)
                        chglogtlt = dTatResults.result[3].filter(c => element.EventID === c.RefEventID);
                    else
                        chglogtlt = [];
                    element.ChgLogtlt = chglogtlt;
                    return element;
                });
            }
        }

        results = results.length === 0 ? dTatResults : results;
        return results;
    }

    mapEventCommentsForCache(dTatResults) {
        let results = [];
        let comments = [];
        let commentsWithEventID = [];
        var count = 0;
        if (dTatResults.result.length > 0) {
            dTatResults.result[0].forEach(element => {
                if (dTatResults.result.length > 1 && dTatResults.result[1].length > 0)
                    comments = dTatResults.result[1].filter(c => element.EventID === c.RefEventID);
                else
                    comments = [];
                commentsWithEventID[count] = { EventID: element.EventID, Comments: comments };
                count++;
                element.Comments = [];
            });
        }

        //results = results.length === 0 ? dTatResults : results;        
        return { Events: dTatResults.result[0], Comments: commentsWithEventID };
    }


    mapEventForCache(rows) {
        let req = {}; req.result = []; let setNo = 0; let lastColumns = "";
        rows.forEach(columns => {
            let rowdTat = new Object(); let currentColumns = "";

            columns.forEach(column => {
                rowdTat[column.metadTat.colName] = column.value;
                currentColumns = currentColumns + column.metadTat.colName;
            });

            if (lastColumns.length > 0 && currentColumns !== lastColumns)
                setNo = setNo + 1;
            if (req.result[setNo] == undefined)
                req.result[setNo] = [];
            req.result[setNo].push(rowdTat);
            lastColumns = currentColumns;
        });

        return this.mapEventCommentsForCache(req);
    }
}

module.exports = ResultMapper;