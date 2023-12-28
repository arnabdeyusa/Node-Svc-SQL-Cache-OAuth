var NodeCache = require("node-cache");
const memoryCache = new NodeCache();

var count = 0;
var staticCount = 0;




var setEventCache = async function (mappedResult, rts = false, ots = false) {
    let eventsWithComments = memoryCache.get('EventsMisc');
    if (eventsWithComments !== undefined) {
        for (var i = 0; i < eventsWithComments.result.Events.length; i++) {
            if (!rts && !ots) {
                if (eventsWithComments.result.Events[i].EventID === mappedResult[0].EventID) {
                    eventsWithComments.result.Events[i] = mappedResult[0];     
                    const cmntIndex = eventsWithComments.result.Comments.findIndex(c=> c.EventID == mappedResult[0].EventID); 
                    if(cmntIndex > -1)  
                        eventsWithComments.result.Comments[cmntIndex] = {EventID: mappedResult[0].EventID, Comments: mappedResult[0].Comments};                   
                    console.log('Event State: update cache with event number ' + mappedResult[0].EventID)
                    memoryCache.set('EventsMisc', eventsWithComments, process.env.CACHE_REFRESH+1);
                    break;
                }
            }
            else if (!ots && rts) {
                if (eventsWithComments.result.Events[i].EventID === mappedResult[0].EventID) {
                    eventsWithComments.result.Events.splice(i, 1);
                    console.log('update cache with event number ' + mappedResult[0].EventID)
                    memoryCache.set('EventsMisc', eventsWithComments, process.env.CACHE_REFRESH+1);
                    break;
                }
            }
            else if (ots) {
                const event = eventsWithComments.result.Events.find(event => event.EventID === mappedResult[0].EventID);
                if (!event) {
                    console.log('update cache with event number ' + mappedResult[0].EventID)
                    eventsWithComments.result.Events.push(mappedResult[0]);
                    memoryCache.set('EventsMisc', eventsWithComments, process.env.CACHE_REFRESH+1);
                    break;
                }
            }
        }
    }
}

module.exports = { memoryCache: memoryCache, setEventCache, count, staticCount };