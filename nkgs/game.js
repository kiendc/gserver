
/*
var game = new WGo.Game(19, "KO");
game.turn = WGo.B;
*/

var goCoordinate = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];
var inTurnGame = 0;

var playingGame =
{
    kifu:  null,
    player: null,
    myTurn: 0,
    gameId: -1,
    nbMove: 0,
    attemptedMove: { x: -1, y: -1 },
    opponentMove: { x: -1, y: -1 },
    lastMove: { x: -1, y: -1 },
    sgfPathStr: ';PB[Black]PW[White]RE[B+R]',
    mode: 0,
    path: null,
    playingNode: null,
    scoreMode: null,
    timeLeft: null,
    timer: null
}

function resetGame()
{ 
    this.nbMove = 0;
    this.gameId = -1;
    this.attemptedMove = { x: -1, y: -1 };
    this.opponentMove =  { x: -1, y: -1 };
    this.lastMove = { x: -1, y: -1 };
    this.sgfPathStr = ';PB[Black]PW[White]RE[B+R]';
    this.mode = 0; // playing mode
    this.path = null;
    this.playingNode = null;
    this.scoreMode = null;
    if (this.timer != null)
    {
        clearInterval(this.timer);
        this.timer = null;
    }

}

function addAttemptedMove(x, y)
{
    console.log('Attempt playing at ' + x + ' ' + y);
    var player = this.player;
    if (player == undefined)
        return;
    var currNode = player.kifuReader.node;
    //var newNode = currNode.appendChild(new WGo.KNode());
    var newNode = new WGo.KNode();
    newNode.parent = currNode;
    newNode.move = { x: x, y: y, c: player.kifuReader.game.turn };
    // always insert at the begining of children.
    currNode.children.unshift(newNode);
    try 
    {
        player.next();
        var attemptedMove = this.attemptedMove;
        attemptedMove.x = x;
        attemptedMove.y = y;
        return { error: 0 };
    }
    catch (err)
    {
        currNode.children.shift();
        alert(err.message);
        return { error: 1 };
    }
    
}

function removeAttemptedMove()
{
   
    console.log('Remove the previous attempt ');
    var player = playingGame.player;
    if (player == undefined)
        return;
    
    var attemptNode = player.kifuReader.node;
    player.previous();
    attemptNode.remove();
    var attemptedMove = this.attemptedMove;
    attemptedMove.x = -1;
    attemptedMove.y = -1;
}

function addAnalyzingMove(x, y)
{
    console.log('Analyzing move at ' + x + ' ' + y);
    var player = this.player;
    if (player == undefined)
        return;
    var currNode = player.kifuReader.node;
    var newNode = currNode.appendChild(new WGo.KNode());
    newNode.move = { x: x, y: y, c: player.kifuReader.game.turn };
    try
    {
        player.next(currNode.children.length - 1);
    }
    catch (err)
    {
        currNode.children.pop();
        alert(err.message);
    }
}

function updateSGFString(x, y, c, game)
{
    if (c == WGo.B)
        game.sgfPathStr += ';B';
    else if (c == WGo.W)
        game.sgfPathStr += ';W';
    else
        return;
    game.sgfPathStr += ('[' + goCoordinate[x] + goCoordinate[y] + ']');
}

function drawGameBoard(gameState, board, lastMove)
{
    //console.log('Draw board ' + JSON.stringify(gameState));
    for (var x = 0; x < gameState.size; x++)
    {
        for (var y = 0; y < gameState.size; y++)
        {
            var s = gameState.get(x, y);
            if (s !== 0)
            {
                board.addObject({ x: x, y: y, c: s });
            }            

        }
    }
    if (lastMove != undefined)
    {
        board.addObject({ x: lastMove.x, y: lastMove.y, type: 'CR' });
    }
    
}

function setupGame(nkgsGame)
{
    console.log('Setup game: ' + JSON.stringify(nkgsGame));
    resetGame.call(playingGame);
    playingGame.gameId = nkgsGame.gameId;
    if (nkgsGame.players[0].userid == userId)
        playingGame.myTurn = WGo.B;
    else
        playingGame.myTurn = WGo.W;
    
    var c = WGo.B;
    for (var i in nkgsGame.moves) {
        updateSGFString(nkgsGame.moves[i].x, nkgsGame.moves[i].y, c, playingGame);
        if (c == WGo.B)
            c = WGo.W;
        else
            c = WGo.B;
    }
    playingGame.nbMove = nkgsGame.moves.length;
    if (playingGame.nbMove > 0)
    {
        playingGame.lastMove.x = nkgsGame.moves[playingGame.nbMove - 1].x;
        playingGame.lastMove.y = nkgsGame.moves[playingGame.nbMove - 1].y;
    }
    console.log('SGF string of game: ' + playingGame.sgfPathStr);
    playingGame.kifu = WGo.Kifu.fromSgf(playingGame.sgfPathStr);

    playingGame.player.loadKifu(playingGame.kifu);
    console.log('Show the current game state on board');
    playingGame.treeViewer.loadKifu(playingGame.kifu);

    console.log('Current Path: ' + JSON.stringify(playingGame.path));
    playingGame.player.last();
    playingGame.treeViewer.last();
    playingGame.path = WGo.clone(playingGame.player.kifuReader.path);
    playingGame.playingNode = playingGame.player.kifuReader.node;
    playingGame.mode = 0;
    playingGame.timeLeft = nkgsGame.timeLeft;
    console.log('Determine turn ' + nkgsGame.players[0].userid + ' ' + userId + ' --> ' + playingGame.myTurn);
}

var switchToAnalyzeMode = function () {
    console.log('Switch game to analyzing mode');
    this.mode = 1;
    this.player.goTo(this.path);
    removeNodeForest(this.player.kifuReader.node);
}

var switchToPlayMode = function ()
{
    console.log('Switch game to playing mode');
    this.mode = 0;
    console.log('Playing path: ' + JSON.stringify(this.path) + ' vs analyzing path' + JSON.stringify(this.player.kifuReader.path));
    this.player.goTo(this.path);
    // Remove all nodes created during analyzing
    removeNodeForest(this.player.kifuReader.node);
}

function saveCurrentPath()
{
    if (this.path != null) {
        delete this.path;
    }
    this.path = WGo.clone(this.player.kifuReader.path);
}


////////////////////////////////////////
function boardClickHandler(x, y)
{
   
    //var gameMode = $('#game-mode input:radio:checked').val();
    var gameMode = playingGame.mode;
    if (gameMode == 0)
    {
        var game = playingGame.player.kifuReader.game;
       
        var attemptedMove = playingGame.attemptedMove;
        var board = playingGame.player.board;
        
        console.log("Click on board with previous attempt: " + JSON.stringify(attemptedMove));
        if (attemptedMove.x >= 0 && (attemptedMove.x != x || attemptedMove.y != y))
        {
            removeAttemptedMove.call(playingGame);
        }
        
        if (playingGame.myTurn != game.turn) {
            console.log('It is not your turn');
            return;
        }

        var playRes = addAttemptedMove.call(playingGame, x, y);
        if (playRes.error == 0) {
           
            console.log('After playing game turn ' + game.turn + " my turn " + playingGame.myTurn);
            $("#btn-submit-move").prop('disabled', false);
        }
    }
    else if (gameMode == 1)
    {
        console.log('Click in analyzing mode');
        addAnalyzingMove.call(playingGame, x, y);
    }
}

function onArrowKeyPressed(e) {
    if (this.mode != 1)
    {
        return true;
    }
    console.log('Player handles keypress');
    switch (e.keyCode) {
        case 39:
            //$("#analyze-mode").click();
            this.player.next();
            break;
        case 37:
            //$("#analyze-mode").click();
            this.player.previous();
            break;
            //case 40: this.selectAlternativeVariation(); break;
        default: return true;
    }
    if (e.preventDefault)
        e.preventDefault();
    return true;
};

function submitMove()
{
    var attemptedMove = this.attemptedMove;
    var lastMove = this.lastMove;

    if (attemptedMove.x == -1)
        return;
    console.log('Sumit a move');
    lastMove.x = attemptedMove.x;
    lastMove.y = attemptedMove.y;
    
    attemptedMove.x = -1;
    attemptedMove.y = -1;
    saveCurrentPath.call(playingGame);
    inTurnGame--;
}

function opponentPlay(move)
{
    
    var player = this.player;
    var board = player.board;
    var currNode = player.kifuReader.node;
    var newNode = currNode.appendChild(new WGo.KNode());
    var oppTurn = WGo.B;
    if (this.myTurn == WGo.B)
        oppTurn = WGo.W;
    newNode.move = { x: move.x, y: move.y, c: oppTurn };
    console.log('Add a node corresponding to opponent mode to kifu');
    player.next();
    saveCurrentPath.call(playingGame);
    
    board.addObject({ x: move.x, y: move.y, type: 'CR' });
    var lastMove = this.lastMove;
    lastMove.x = move.x;
    lastMove.y = move.y;
}

function intializeInTurnGames(userId, games)
{
    inTurnGame = 0;
    for (var i in games)
    {
        var g = games[i];
        var order = 0;
        if (userId == g.players[1].userid)
            order = 1;
        if ((order == 0 && g.state.color == WGo.W) || (order == 1 && g.state.color == WGo.B))
            inTurnGame++;
    }
}


$(document).ready(function () {
     console.log('DOM ready in game.js');
});