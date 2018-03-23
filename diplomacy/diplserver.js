var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
"use strict";

var userManager = require('./user-manager.js');
userManager.loadConfig("conf.txt");

var gameManager = require('./game-manager.js');
gameManager.loadConfig("conf.txt");

var clients = [];

var diplomacy = require("js-diplomacy");
var rule = new diplomacy.standardRule.Rule;
var map = diplomacy.standardMap;
var RuleUtils = diplomacy.standardRule.Utils;
var RuleHelper = diplomacy.standardRule.Helper;
//console.log(map.map.provinces);
/*
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


*/
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var secret = 'fred-ne-veut-pas-dire';
console.log('Argument ' + JSON.stringify(process.argv));
//console.log("Diplomacy: " + JSON.stringify(diplomacy));

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

/*
app.use(cookieParser());
app.use(session);
app.use(bodyParser.json());

io.use(sharedsession(session));

io.use(socketioJwt.authorize({
    secret: secret,
    handshake: true
}));
*/
///////////////////////////////////////////////



app.get('/', function (req, res) {
    "use strict";
    console.log('Process routing / with cookie', req.cookie);
    res.sendFile(__dirname + '/diplapp.html');
});

app.get('/example', function (req, res) {
    console.log('Process routing / with cookie', req.cookie);
    res.sendFile(__dirname + '/example.html');

});

app.get('/test-react', function (req, res) {
    console.log('Process routing / with cookie', req.cookie);
    res.sendFile(__dirname + '/test-react.html');

});

app.post('/login', function (req, res) {
    console.log('Proces route /login ' + JSON.stringify(req.body) + ' req.query ' + JSON.stringify(req.query) + ' req.cookie ' + JSON.stringify(req.cookie));
    var user = undefined;
    var u = userManager.findUserByName(req.body.username);
    if (u != undefined) {
        if (u.password == req.body.password) {
            user = {
                userid: u.userid,
                username: u.username
            }; 
        }
    }

    if (user !== undefined) {
        var token = jwt.sign(user, secret, { expiresIn: '10h' });
        res.json({ error: 0, token: token, user: user });
    }
    else {
        res.json({ error: 1, token: {} });
    }
    console.log('Finish processing route /login ');
});

http.listen(8712, function(){
    console.log('listening on *: 7908');
});

///////////////////////////////////////////////

io.on('connection', function(socket){
    console.log(' on connection of socket io');
    console.log('socket.handshake.session: ' + JSON.stringify(socket.handshake.session));
    console.log('Decoded token', JSON.stringify(socket.decoded_token));
       
    socket.on('game', onReceiveGameRequest.bind(socket));
    socket.on('orders', onReceiveOrders);
    socket.on('get-movableLocations-of', onGetMovableLocationOf.bind(socket));
    socket.on('get-supportableOrders-of', onGetSupportableOrderOf.bind(socket));
    socket.on('get-convoyableMoves-of', onGetConvoyableOrdersOf.bind(socket));
    socket.on('disconnect', function () {
        console.log('Client disconnect');
    });
 
});

function onReceiveGameRequest(gameReq)
{
    console.log("Get a game request");
    console.log(gameReq);
    var game = gameManager.findGame(gameReq.gameId);
    if (game == undefined)
        return;
    
    var userPower = gameManager.findPowerOfUser(game, gameReq.userId);
    console.log(userPower);
    if (userPower == -1)
        return;
    var neighborMap = getNeighborhoodData();
    //console.log(diplomacy.standardMap.locations);
    //console.log(neighborMap);
    this.emit("game-data", {
        game: game.data,
        board: {
            provinces: diplomacy.standardMap.map.provinces,
            neighborMap: neighborMap
        },
        userPower: userPower
    });
}
function onReceiveOrders(orderData)
{
    console.log("Receive orders from ");
    console.log(orderData);
}

function onGetMovableLocationOf(req)
{
    console.log("Receive Get movable locations of: " + JSON.stringify(req));
    var outMsg = 'movableLocations-of';
    var board = getGameBoard(req.gameId);
    if (board == undefined)
    {
        this.emit(outMsg, []);
        return;
    }
        
    var unit = Array.from(board.units).find(x => x.location.name.abbreviatedName === req.unit.location);
    var locations = [];
    RuleUtils.movableLocationsOf(board, unit).forEach(x => locations.push(x.name.abbreviatedName));
    
    this.emit(outMsg, locations);
    console.log(locations);
    return locations;
}

function onGetSupportableOrderOf(req)
{
    console.log("Receive Get supportable locations of: " + JSON.stringify(req));
    var board = getGameBoard(req.gameId);
    if (board == undefined)
    {
        this.emit('supportableOrders-of', []);
        return;
    }
        
    
    var unit = Array.from(board.units).find(x => x.location.name.abbreviatedName === req.unit.location);
    if (unit == undefined )
    {
        this.emit('supportableOrderss-of', []);
        return;
    }
        
    var locations = RuleUtils.supportableLocationsOf(board.map, unit);
    var orders = [];
    var $$ = new RuleHelper(board);
    locations.forEach(function(l)
    {
        if (l == undefined)
            return;
        var hasUnit = true;
        try
        {
            var unit = $$.getUnit(null, l);
        }
        catch (ex)
        {
            //console.log("Could not get unit");
            hasUnit = false;
        }
        if (hasUnit)
        {
           
            orders.push({
                unit: {
                    location: l.name.abbreviatedName,
                    militaryBranch: unit.militaryBranch,
                },

                action: "H", 
            });   
            
        }
        //console.log("Looking for move order to l");
    
        var neighbors = board.map.map.neighborsOf(l);
        
        neighbors.forEach(function(n)
        {
           
            var nl = n[0];
            if (nl.name.abbreviatedName == req.unit.location)
                return;
            hasUnit = true;
            try {
                var otherUnit = $$.getUnit(null, nl);
            }
            catch (ex)
            {
                console.log("No unit from nl to move to l");
                hasUnit = false;
            }

            if (hasUnit)
            {
                if (l.militaryBranches.has(otherUnit.militaryBranch))
                {
                    orders.push({
                        unit: {
                            location: nl.name.abbreviatedName,
                            militaryBranch: otherUnit.militaryBranch,
                        },
                        action: "M",
                        destination: l.name.abbreviatedName,
                    })
                }
                
            }   
        });

        
    });
    console.log('Finish');
    console.log("Result: " + JSON.stringify(orders));
    this.emit('supportableOrders-of', orders);
    return orders;
}

function onGetConvoyableOrdersOf(req)
{
    var board = getGameBoard(req.gameId);
    if (board == undefined)
    {
        this.emit('convoyableMoves-of', []);
        return;
    }
    var location = Array.from(board.map.locations).filter(l => l.name.abbreviatedName == req.unit.location);
   
    if (!RuleUtils.isSea(board.map, location.province))
    {
        this.emit('convoyableMoves-of', []);
        return;
    }
    var orders = [];
    
    var neighbors = board.map.map.neighborsOf(location);
        
    neighbors.forEach(function(n)
    {
        console.log(n);
        var nl = n[0];
        var unit = null;
        try
        {
            unit = getUnit(null, nl);
        }
        catch (ex)
        {
            unit = null;
        }
        if (unit == null)
            return;
        var movableLocations = RuleUtils.movableViaConvoyLocationsOf(board, unit);
        movableLocations.forEach(function(l)
        {
            orders.push({
                unit: {
                    location: nl,
                    militaryBranch: unit.militaryBranch,
                },
                action: "M",
                destination: l.name.abbreviatedName,
            });
        });
    });
    this.emit('convoyableMoves-of', orders);
    return;
}
////////////////////////////////////////////
//testCreateGame();
//testLoadGame();
//testResolve();


function getNeighborhoodData()
{
    var neighborMap = []
    diplomacy.standardMap.map.map.neighborLists.forEach(function (v, k, m) {
        var neighbors = []
        //console.log(k.name.abbreviatedName + " => {");
        v.forEach(function (v1, v2, s) {
            this.push([v1[0].name.abbreviatedName, Array.from(v1[1])]);
        }, neighbors);
        //console.log(neighbors);
        this.push([k.name.abbreviatedName, neighbors]);
        //console.log("}");
    }, neighborMap);
    return neighborMap;
}

function testCreateGame()
{
    var game = gameManager.createGame([
    { userId: 0, power: 1 },
    { userId: 1, power: 4 },
    { userId: 2, power: 3 },
    { userId: 3, power: 5 },
    { userId: 4, power: 6 },
    { userId: 5, power: 2 },
    { userId: 6, power: 7 }
    ]);
    var board = diplomacy.standard.variant.initialBoard;
    game.data.state = createGameStatesData(board);

    gameManager.saveGame(game.gameId);
}

function testLoadGame()
{
    var board = getGameBoard(0);
    console.log(board);
}



function testResolve()
{
    var board = getGameBoard(0);

    const $ = diplomacy.standardMap.locations; // This defines locations (e.g., StP_SC, Swe)
    //console.log($);
    //console.log($.StP_SC);
    //console.log($.Boh);
    let $$ = new diplomacy.standardRule.Helper(board) // Create a helper instance
 
    const orders = [
      $$.F($.Lon).move($.Nth),
      $$.F($.Edi).move($.Nrg),
      $$.A($.Lvp).move($.Yor), // This is a Yor OP.
      $$.U($.Con).move($.Bul) // We have not to specify Fleet or Army if we use `U` function
    ];

    resolve(board, orders);
}
/////////////////////////////////////////
function createGameEngineOrder(board, order) {
    const $ = diplomacy.standardMap.locations; // This defines locations (e.g., StP_SC, Swe)
    //console.log($);
    //console.log($.StP_SC);
    //console.log($.Boh);
    let $$ = new diplomacy.standardRule.Helper(board) // Create a helper instance
    const l = $[order.unit.location];
    const t = order.action;
    switch (t) {
        case "H":
            if (l) {
                return $$.U(l).hold();
            }
            break;
        case "M":
            {
                const l2 = $[order.destination];
                return $$.U(l).move(l2);
            }
            break;
        case "S":
            {
                const o = createGameEngineOrder(order.destination);
                return $$.U(l).support(o);
                
            }
            break;
        case "C":
            {
                const o = createGameEngineOrder(order.destination);
                if (o instanceof diplomacy.standardRule.Order.Move) 
                {
                    return $$.U(l).convoy(o);                
                }
            }
            break;
        case "R":
            {
                const l2 = $[order.destination];
                if (l && l2) {
                    return $$.U(l).retreat(l2);
                }
            }
        case "D"
            if (l) {
                return $$.U(l).disband();
            }
            break;
        case "B":
            {
                switch (order.unit.militaryBranch) {
                    case MilitaryBranch.Army:
                        return $$.A(l).build();
                    case MilitaryBranch.Fleet:
                        return $$.F(l).build();
                }
            }
            break;
    }
}

function resolve(gameId)
{

    var game = gameManager.findGame(gameId);
    if (game == undefined)
        return;
    var board = game.board;
    var orders = [];
    game.currentOrders.forEach(function (power) {
        orders = orders.concat(power.orders);
    });

    const result = rule.resolve(board,orders) // Resolve the orders using the default rule

    if (result.result) {
        board = result.result.board; // Go to the next turn (1901 Autumn, Movement phase)
        //console.log(result.result.results); // Show results
        //console.log("Board after: " + JSON.stringify(board));
        //console.log(board); // Show results
    
   
    }
}

function createGameStatesData(board)
{
    var gameState = {
        year: board.state.turn.year,
        season: board.state.turn.season,
        phase: board.state.phase,
        units: [],
        unitStatuses: [],
        provinceStatuses : []
        
    };
   
    board.unitStatuses.forEach(function (value, key, m) {
        gameState.unitStatuses.push([key, value]);
    });

    board.provinceStatuses.forEach(function (value, key, m) {
        gameState.provinceStatuses.push([
            key.name.abbreviatedName,
            {
                occupied: value.occupied,
                standoff: value.standoff
            }
        ]);
    });
    board.units.forEach(function(v1, v2, s){
        gameState.units.push({
            militaryBranch: v1.militaryBranch,
            power: v1.power,
            locationName: v1.location.name.toString()
        })
    });

    return gameState;
}


function getGameBoard(gameId)
{
    var game = gameManager.findGame(gameId);
    if (game == undefined)
        return undefined;
    if (game.board != undefined)
        return game.board;

    var gameState = game.data.state;
    turn = new diplomacy.standardBoard.Turn(gameState.year, gameState.season);
    state = new diplomacy.standardRule.State(turn, gameState.phase)
    var units = [];
    gameState.units.forEach(function(elem){
        var location = map.locations[elem.locationName];
        if (location != undefined) {
            elem.location = location;
            units.push(new diplomacy.board.Unit(elem.militaryBranch, elem.location, elem.power));
        }            
    });
    var provinceStatuses = [];
    gameState.provinceStatuses.forEach(function (elem) {
        var location = map.locations[elem[0]];
        if (location != undefined)
        {
            provinceStatuses.push([location.province, { occupied: elem.occupied, standoff: elem.standoff }]);
        }
    });
    //console.log(gameState);
    game.board = new diplomacy.board.Board(diplomacy.standardMap.map, state, units, gameState.unitStatuses, provinceStatuses);
    //console.log(board);
    return game.board;
}

function exitHandler(options, err) {
    if (options.cleanup)
    {
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
