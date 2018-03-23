
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
            map: 0,
            players: playerIds,
            order: [],
            state: undefined,
            messages: []
        },
        playerOnGame: 0,
        clients: [],
        currentOrders: [],
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
        var game = {};
        game.gameId = gId;
        var fileName = 'games/g' + gId + '.txt';
        try {
            var data = fs.readFileSync(fileName);

            game.data = JSON.parse(data);
            if (game.data.messages == undefined) {
                game.data.messages = [];
            }
            
            //console.log('Load game data from file');
            // Do something
        } catch (e) {
            console.log("Error in loading game " + gId );
            
        }

        game.playerOnGame = 0;
        game.clients = [];
        game.currentOrders = [
            { power: 1, orders: [] },
            { power: 2, orders: [] },
            { power: 3, orders: [] },
            { power: 4, orders: [] },
            { power: 5, orders: [] },
            { power: 6, orders: [] },
            { power: 7, orders: [] }
        ];
        exports.games.push(game);
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
    var game = findGame(gameId);

    if (game) {
        fs.writeFileSync('games/g' + gameId + '.txt', JSON.stringify(game.data));
    }

}

function findPowerOfUser(game, userId)
{
    var players = game.data.players;
    //console.log(players);
    for (var p in players)
    {
        var player = players[p];
        if (player.userId == userId)
        {
            return player.power;
        }
    }
    return -1;
}

exports.saveGame = saveGame;
exports.findGame = findGame;
exports.findPowerOfUser = findPowerOfUser;