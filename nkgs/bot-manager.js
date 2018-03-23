// JavaScript source code
var fs = require('fs');
var spawn = require('child_process').spawn;
var Leela = require('./leela.js');
exports.goBots = [];
exports.UIDs = [];

function loadConfig(cfgFile)
{
    var conf = undefined;
    try {
        console.log('Load bot configuration file ' + cfgFile);
        var fileName = 'bots/' + cfgFile;
        var data = fs.readFileSync(fileName);
        console.log('Bot configuration file content: ' + data);
        conf = JSON.parse(data);
        
    }
    catch (e) {
        console.log('Error in reading bot configuration file ' + JSON.stringify(e));
        return;
    }
    if (conf == undefined) {
        return;
    }
    exports.UIDs = conf.UIDs;
    console.log('List UID of bots: ' + JSON.stringify(exports.UIDs));
}

function hasBotOfUID(uId)
{
    if (exports.UIDs.indexOf(uId) != -1)
        return true;
    return false;
}

function createPlayer(gId, bId)
{
    var leela = new Leela(gId, exports.UIDs[bId]);
    leela.initGame(19);
    exports.goBots.push({ gameId: gId, bot: leela });
    console.log('Leela plays game ' + gId);
    return leela;
}

function removePlayer(gId)
{
    for (var i = 0; i < exports.goBots.length; i++) {

        var bots = exports.goBots;
        if (bots[i].gameId == gId) {
            bots[i].bot.quitGame();
            bots.splice(i, 1);
            break;
        }
    }
}

function findPlayer(gId)
{
    for (var i = 0; i < exports.goBots.length; i++) {

        var bots = exports.goBots;
        if (bots[i].gameId == gId) {
            return bots[i];
        }
    }
    return undefined;
}

function quit()
{
    while (exports.goBots.length > 0)
    {
        var goBot = exports.goBots.pop();
        goBot.bot.quitGame();
    }
}

exports.loadConfig = loadConfig;
exports.hasBotOfUID = hasBotOfUID;
exports.findPlayer = findPlayer;
exports.createPlayer = createPlayer;
exports.removePlayer = removePlayer;
exports.quit = quit;