
var fs = require('fs');

exports.maxGID = 0;
exports.cfgFile = '';


exports.saveConfig = function()
{
    var conf = {
        maxGID : exports.maxGID,
        games : []
    }
    console.log('Save ' + JSON.stringify(exports.games.length) + ' games');
    for (var i in exports.games)
    {
        var gId = exports.games[i].gameId;
        conf.games.push(gId);
        saveGame(gId);
    }
    console.log('Save configuration: ' + JSON.stringify(conf));
    fs.writeFileSync('games/' + exports.cfgFile, JSON.stringify(conf));
}

exports.createGame = function (playerIds)
{
    var gId = exports.maxGID;
    var game = {
        gameId: gId,
        data: {
            type: 0,
            players: playerIds,
            moves: [],
            state: {},
            messages: []
        },
        playerOnGame: 0,
        clients: [undefined, undefined]
    }
    exports.games.push(game);
    exports.maxGID++;
    return game;
}

exports.loadConfig = function (cfgFile)
{
    var conf = undefined;
    try 
    {
        console.log('Load game config file ' + cfgFile);
        var fileName = 'games/' + cfgFile;
        var data = fs.readFileSync(fileName);
        console.log('Config file content: ' + data);
        conf = JSON.parse(data);
        exports.cfgFile = cfgFile;
    }
    catch (e)
    {
        exports.games = undefined;
        console.log('Error in reading game configuration file');
        return;
    }
    exports.maxGID = conf.maxGID;
    exports.games = [];
    var gameIds = conf.games;
    console.log('Number of games to load: ' + gameIds.length);
    for (var i in gameIds) {
        var gId = gameIds[i];
        var nkgsGame = {};
        nkgsGame.gameId = gId;
        var fileName = 'games/g' + gId + '.txt';
        try {
            var data = fs.readFileSync(fileName);

            nkgsGame.data = JSON.parse(data);
            if (nkgsGame.data.messages == undefined) {
                nkgsGame.data.messages = [];
            }
            if (nkgsGame.data.type == undefined) {
                nkgsGame.data.type = 0;
            }
            if (nkgsGame.data.timeLeft == undefined) {
                nkgsGame.data.timeLeft = [10800, 10800]; //3 hours
            }
            //console.log('Load game data from file');
            // Do something
        } catch (e) {
            console.log("Error in loading game " + gId );
            
        }

        nkgsGame.playerOnGame = 0;
        nkgsGame.clients = [undefined, undefined];
        exports.games.push(nkgsGame);
    }
    console.log('Number of loaded games: ' + exports.games.length);
}

function findGame(gameId)
{
    for (var i in exports.games)
    {
        var g = exports.games[i];
        if (g.gameId == gameId)
            return g;
    }
    return undefined;
}

function saveGame(gameId)
{
    var nkgsGame = findGame(gameId);

    if (nkgsGame) {
        console.log('Save a game of ' + nkgsGame.data.moves.length + ' move');
        fs.writeFileSync('games/g' + gameId + '.txt', JSON.stringify(nkgsGame.data));
    }

}
exports.saveGame = saveGame;
exports.findGame = findGame;