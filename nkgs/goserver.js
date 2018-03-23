var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var session = require("express-session")({
    secret: "secret",
    key: 'express.sid',
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var cookieParser = require('cookie-parser');
var socketioJwt = require("socketio-jwt");
var jwt = require('jsonwebtoken');
var bodyParser = require("body-parser");
var secret = 'nkgs-secret';


console.log('Argument ' + JSON.stringify(process.argv));
process.chdir(__dirname);
var cfgManager = require('./config-manager.js');
if (process.argv.length < 3)
{
    cfgManager.loadConfig();
}
else
{
    cfgManager.loadConfig(process.argv[2]);
}

var config = cfgManager.config;
console.log('Config: ' + JSON.stringify(config));

var userManager = require('./user-manager.js');
userManager.loadConfig(config.userConf);
var nkgsUsers = userManager.users;

var connectedUsers = [];


var gameManager = require('./game-manager.js');
gameManager.loadConfig(config.gameConf);
var nkgsGames = gameManager.games;

var reqManager = require('./req-manager.js');
reqManager.loadConfig(config.reqConf);

var botManager = require('./bot-manager.js');
botManager.loadConfig(config.botConf);


app.use(express.static(__dirname));
app.use('/user/:userId/game/:gameId', express.static(__dirname));

app.use(cookieParser());
app.use(session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

io.use(sharedsession(session));

io.use(socketioJwt.authorize({
    secret: secret,
    handshake: true
}));

///////////////////////////////////////////////

app.post('/login', function (req, res) {
    console.log('Proces route /login ' + JSON.stringify(req.body) + ' req.query ' + JSON.stringify(req.query) + ' req.cookie ' + JSON.stringify(req.cookie));
    var user = undefined;
    for (var u in nkgsUsers)
    {
        if (nkgsUsers[u].username == req.body.username && nkgsUsers[u].password == req.body.password)
        {
            user = {
                userid: nkgsUsers[u].userid,
                username: nkgsUsers[u].username
            };
            break;
        }

    }
    
    if (user !== undefined)
    {
        var token = jwt.sign(user, secret, { expiresIn: '10h' });
        res.json({ error: 0, token: token, user: user });
    }
    else
    {
        res.json({ error: 1, token: {} });
    }
    console.log('Finish processing route /login ');
});

app.get('/', function (req, res) {
    console.log('Process routing / with cookie', req.cookie);
    res.sendFile(__dirname + '/goapp.html');
    
});

http.listen(config.port, function(){
  console.log('listening on *: ' + config.port);
});

///////////////////////////////////////////////

io.on('connection', function(socket){
    console.log(' on connection of socket io');
    console.log('socket.handshake.session: ' + JSON.stringify(socket.handshake.session));
    console.log('Decoded token', JSON.stringify(socket.decoded_token));
    var userId = socket.decoded_token.userid;
    var userName = socket.decoded_token.username;
    socket.userid = userId;
    socket.broadcast.emit('hi', { userid: userId, username: userName });
    var connUser = undefined;
    for (var i in connectedUsers)
    {
        if (connectedUsers[i].userid == userId)
        {
            connUser = connectedUsers[i];
            break;
        }
    }
    if (connUser == undefined)
    {
        console.log('User ' + userId + ' is added in connUser list');
        connectedUsers.push({
            userid: userId,
            username: userName,
            socket: socket
            });
    }
    else
    {
        console.log('User ' + userId + ' is already connected, disconnect old socket');
        connUser.socket.removeAllListeners('disconnect');
        connUser.socket.removeAllListeners('add-move');
        connUser.socket.removeAllListeners('save-game');
        connUser.socket.removeAllListeners('play-game');
        connUser.socket.removeAllListeners('in-game-msg');
        connUser.socket.emit('login-elsewhere');
        connUser.socket = socket;
    }

    sendHomePageData(userId);

    socket.on('add-move', addMoveHandler);
    socket.on('close-game', closeGameHandler);
    socket.on('save-game', saveGameHandler);
    socket.on('play-game', playGameHandler);
    socket.on('in-game-msg', inGameMsgHandler);
    socket.on('add-game-req', addGameReqHandler);
    socket.on('accept-game-req', acceptGameReqHandler);
    socket.on('remove-game-req', refuseGameReqHandler);
    socket.on('disconnect', function () {
        if (socket.userid !== undefined)
        {
            var uId = socket.userid;
            console.log('player ' + uId + ' disconnected ');
            for (var i in connectedUsers)
            {
                if (connectedUsers[i].userid == uId)
                {
                    userManager.saveUser(uId);
                    socket.broadcast.emit('bye', uId);
                    connectedUsers.splice(i, 1);
                    break;
                }
            }
            
        }
        
    });
    
});


function addMoveHandler(data) {
    var gameId = data.gameId;
    var game = gameManager.findGame(gameId);
    if (game == undefined)
    {
        return;
    }
    //console.log('Add move handler: ' + JSON.stringify(data));
    game.data.moves.push(data.move);
    if (data.state != undefined)
    {
        game.data.state = data.state;
    }
        
    if (data.timeLeft != undefined)
    {
        game.data.timeLeft[data.order] = data.timeLeft;
    }

    console.log('user ' + data.userid + ' that has order ' + data.order + ' plays (' + data.move.x + ' ' + data.move.y + ') for game ' + data.gameId);
    var oppOrder = 1 - data.order;
    var oppSock = game.clients[oppOrder];

    if (oppSock === undefined) // Looking for in connected users 
    {
        var oppId = game.data.players[oppOrder];
        console.log('Opponent ' + oppId + ' is not connected to game ');
        for (var i in connectedUsers) {
            if (oppId == connectedUsers[i].userid) {
                oppSock = connectedUsers[i].socket;
                break;

            }
        }
    }

    if (!(oppSock === undefined)) {
        oppSock.emit('opp-move', { gameId: gameId, x: data.move.x, y: data.move.y, timeLeft: data.timeLeft});
        console.log("Inform to " + oppSock.userid + ' that ' + data.userid + ' play a move for game ' + gameId);
    }

    if (game.data.type == 1 && !botManager.hasBotOfUID(data.userid)) {
        console.log("Bot will reply this move");
        var gameBot = botManager.findPlayer(gameId);
        if (gameBot == undefined)
            gameBot = botManager.createPlayer(gameId, 0);
        gameBot.bot.replyMove(data.order, data.move);
    }
}

function botAddMoveHandler(data)
{
    console.log('Bot play a move ' + JSON.stringify(data));
    addMoveHandler(data);
}

function closeGameHandler(data)
{
    var gameId = data.gameId;
    var userId = data.userid;
    
    console.log('User ' + data.userid + ' quit game ' + gameId);
    //saveGame(gameId);
    var game = gameManager.findGame(gameId);
    if (game != undefined)
    {
        game.playerOnGame--;
        var players = game.data.players;
        if (userId == players[0]) {
            game.clients[0] = undefined;
            if (data.timeLeft != undefined)
            {
                game.data.timeLeft[0] = data.timeLeft[0];
            }
        }
        else if (userId == players[1]) {
            game.clients[1] = undefined;
            if (data.timeLeft != undefined) {
                game.data.timeLeft[1] = data.timeLeft[1];
            }
        }
        gameManager.saveGame(gameId);
        if (game.data.type == 1)
        {
            botManager.removePlayer(gameId);
        }
    }
    
    sendHomePageData(userId);
   
}

function saveGameHandler(data)
{
    var gameId = data.gameId;
    var userId = data.userid;
    console.log('User ' + data.userid + ' save game ' + gameId);
    gameManager.saveGame(gameId);   
}

function playGameHandler(data)
{
    var gameId = data.gameId;
    var userId = data.userid;
    var game = gameManager.findGame(gameId);
    if (game == undefined)
        return;

    var gameData = game.data;
    var order = -1;
    if (gameData.type == 1 && !botManager.hasBotOfUID(data.userid))
    {
        var goBot = botManager.createPlayer(gameId, 0);
        var c = 0;
        for (var m in gameData.moves)
        {
            goBot.playMove(c, gameData.moves[m]);
            c = 1 - c;
        }
        goBot.setCallBackFunction('genmove', botAddMoveHandler);
    }

    if (userId == gameData.players[0]) {
        order = 0;
    }
    else if (userId == gameData.players[1]) {
        order = 1;
    }

    if (order <= -1)
        return;
    var players = [{
        userid: gameData.players[0],
        username: userManager.getUserName(gameData.players[0])
    },
    {
        userid: gameData.players[1],
        username: userManager.getUserName(gameData.players[1])
    }];

    for (var i in connectedUsers) {
        if (connectedUsers[i].userid == userId) 
        {
            console.log('Set user ' + userId + ' as client ' + order)
            var gamePageData = {
                gameId: gameId,
                players: players,
                moves: gameData.moves,
                messages: gameData.messages,
                timeLeft: gameData.timeLeft,
                order: order
            };
            game.clients[order] = connectedUsers[i].socket;
            game.playerOnGame++;
            connectedUsers[i].socket.emit('show-game-page', gamePageData);
            return;
        }
    }

    console.log('Error in sending game data back to user');
    
}

function inGameMsgHandler(data)
{
    var gId = data.gameId;
    console.log('Message in game ' + JSON.stringify(data));
    var oppOrder = 1 - data.order;
    
    nkgsGames[gId].data.messages.push({ order: data.order, msg: data.msg });
    var oppSock = nkgsGames[gId].clients[oppOrder];
    if (!(oppSock === undefined)) {
        oppSock.emit('opp-msg', { order: data.order, msg: data.msg });
        console.log("transfer msg to " + oppSock.userid + ' from ' + data.userid + ' in game ' + gId);
    }

}

function addGameReqHandler(req)
{
    var userId = req.userid;
    var sender = userManager.findUser(userId);
    if (sender == undefined)
        return;
    var opponent = userManager.findUserByName(req.opponent);
    if (opponent == undefined)
        return;
    var reqId = reqManager.createReq([userId, opponent.userid], userId);
    for (var i in connectedUsers)
    {
        if (connectedUsers[i].userid == userId)
        {
            var sSock = connectedUsers[i].socket;
            console.log('Confirm to ' + userId + ' that a request is sent to ' + opponent.userid);
            
            sSock.emit('game-req-add-confirm', {
                reqId: reqId,
                type: 1,
                opponent: {
                    userid: opponent.userid,
                    username: opponent.username
                }
            });
        }
        else if (connectedUsers[i].userid == opponent.userid)
        {
            var rSock = connectedUsers[i].socket;
            console.log('Send to ' + opponent.userid + ' the game request of ' + userId);
            rSock.emit('game-req-add-confirm', {
                reqId: reqId,
                type: 0,
                opponent: {
                    userid: sender.userid,
                    username: sender.username
                }
            });
        }
    }
}

function acceptGameReqHandler(data) {
    var reqId = data.reqId;
    var req = reqManager.findRequest(reqId);
    if (req == undefined)
        return;
    console.log('Request accepted: ' + JSON.stringify(req));
    var game = createGameForUsers(req.players);
    for (var i in connectedUsers) {
        if (connectedUsers[i].userid == req.players[0] || connectedUsers[i].userid == req.players[1])
        {
            var sSock = connectedUsers[i].socket;
            console.log('Confirm that a game is created and remove request ');
            sSock.emit('game-req-rem-confirm', {
                reqId: reqId,
                game: {
                    gameId: game.gameId,
                    players: game.data.players,
                    state: game.data.state
                }
            });
        }
        
    }
    reqManager.removeReq(reqId);
}

function refuseGameReqHandler(data) {
    var reqId = data.reqId;
    var req = reqManager.findRequest(reqId);
    if (req == undefined)
        return;
    console.log('Request refused: ' + JSON.stringify(req));
    for (var i in connectedUsers) {
        if (connectedUsers[i].userid == req.players[0] || connectedUsers[i].userid == req.players[1]) {
            var sSock = connectedUsers[i].socket;
            console.log('Confirm that a game is created and remove request ');
            sSock.emit('game-req-rem-confirm', {
                reqId: reqId
            });
        }

    }
    reqManager.removeReq(reqId);
}

function exitHandler(options, err) {
    if (options.cleanup)
    {
        console.log('save game management config');
        gameManager.saveConfig();
        userManager.saveConfig();
        reqManager.saveConfig();
        botManager.quit();
    }
        
    if (err)
    {
        console.log(err.stack);
    }
        
    if (options.exit)
    {
        console.log('Exit here');
        process.exit();
    }
        
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
///////////////////////

function sendHomePageData(userId)
{
    var availUsers = [];
    var socket = undefined;
    var userName = undefined;
    for (var u in connectedUsers)
    {
        if (connectedUsers[u].userid != userId)
        {
            availUsers.push({ userid: connectedUsers[u].userid, username: connectedUsers[u].username });
        }
        else
        {
            socket = connectedUsers[u].socket;
            userName = connectedUsers[u].username;
        }
    }

    var games = [];
    var reqs = [];
    var u = userManager.findUser(userId);
    if (u == undefined)
    {
        return;
    }
        
    console.log('User ' + u.userid + ': ' + JSON.stringify(u));
    for (var j in u.games)
    {
        var gId = u.games[j];
        var g = gameManager.findGame(gId);
        if (g)
        {
            var players = [{
                userid: g.data.players[0],
                username: userManager.getUserName(g.data.players[0])
            },
            {
                userid: g.data.players[1],
                username: userManager.getUserName(g.data.players[1])
            }];

            games.push({ gameId: gId, players:players ,state: g.data.state });
        }     
    }

    var reqs = reqManager.findReqsByUser(userId);
    for (var j in reqs)
    {
        var r = reqs[j];
        r.opponent.username = userManager.getUserName(r.opponent.userid);
        
    }
    console.log('Send game request to ' + userId + ': ' + JSON.stringify(reqs));

    socket.emit('show-home-page', {
        userid: userId,
        username: userName,
        availUsers: availUsers,
        games: games,
        reqs: reqs
    });
    
   
}

function createGameForUsers(userIds)
{
    var game = gameManager.createGame(userIds);
    console.log('A new game is created: ' + game.gameId);
    var isBotGame = false;
    for (var i in userIds)
    {
        var uId = userIds[i];
        if (botManager.hasBotOfUID(uId))
            isBotGame = true;
        var user = userManager.findUser(uId);
        user.games.push(game.gameId);
    }
    if (isBotGame)
        game.data.type = 1; 
    return game
}






