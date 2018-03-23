var fs = require('fs');

exports.maxRID = 0;
exports.cfgFile = '';

function loadConfig(cfgFile) {
    var conf = undefined;
    try {
        console.log('Load request configuration file ' + cfgFile);
        var fileName = 'reqs/' + cfgFile;
        var data = fs.readFileSync(fileName);
        console.log('Request configuration file content: ' + data);
        conf = JSON.parse(data);
        exports.cfgFile = cfgFile;
    }
    catch (e) {
        exports.requests = [];
        console.log('Error in reading request configuration file');
        return;
    }
    if (conf == undefined) {
        return;
    }
    exports.maxRID = conf.maxRID;
    exports.requests = conf.requests;

    console.log('All user in server: ' + JSON.stringify(exports.requests));
}

function saveConfig()
{
    fs.writeFileSync('reqs/' + exports.cfgFile, JSON.stringify({
        maxRID: exports.maxRID,
        requests: exports.requests
    }));
}

function createReq(players, sender)
{
    exports.requests.push({ reqId: exports.maxRID, players: players, sender: sender });
    exports.maxRID++;
    return exports.maxRID - 1;
}

function removeReq(reqId)
{
    for (var i = 0; i < exports.requests.length; i++)
    {
        var reqs = exports.requests;
        if (reqs[i].reqId == reqId)
        {
            reqs.splice(i, 1);
            break;
        }
    }
}

function findReqsByUser(userId)
{
    var reqs = [];
    for (var i in exports.requests)
    {
        var r = exports.requests[i];
        if (userId != r.players[0] && userId != r.players[1])
            continue;
        var oppId = r.players[1];
        if (userId == r.players[1])
            oppId = r.players[0];
        var reqType = 0;
        if (userId == r.sender)
            reqType = 1;
        reqs.push({
            reqId: r.reqId,
            type: reqType,
            opponent: {
                userid: oppId,
                username: undefined
            }
        });
    }
    return reqs;
}

function findRequest(reqId)
{
    for (var i in exports.requests) {
        var r = exports.requests[i];
        if (r.reqId == reqId)
            return r;
    }
    return undefined;

}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.createReq = createReq;
exports.removeReq = removeReq;
exports.findReqsByUser = findReqsByUser;
exports.findRequest = findRequest;