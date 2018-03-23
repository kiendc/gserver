
var socket = io.connect('', {
    query: 'token=' + 'nkgs-secret'
});

var game = new WGo.Game(19, "KO");
game.turn = -1;

var myTurn = 0;
var userId = -1;
var gameId = -1;
var attemptedMove = { x: -1, y: -1 };
socket.on('error', function (err) {
    console.log('Authentication failed ' + JSON.stringify(err));
});
// Authentication passed 
socket.on('success', function (data) {
    console.log('Authentication success' + JSON.stringify(data));
  
});

socket.on("unauthorized", function (error) {
    if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
        // redirect user to login page perhaps or execute callback:
        console.log("User's token has expired");
    }
});
socket.on('connect', function () {
    console.log('Client connect to server');
});

function playAt(x, y)
{
	res = game.play(x, y, game.turn);
	if (res instanceof Array)
	{
		board.addObject({
                x: x,
                y: y,
                c: game.turn
            });
		for ( i in res)
		{
			board.removeObject({x : res[i].x, y : res[i].y});
		}
		return true;
	}
	return false;
}

function boardClickHandler(x, y)
{
    if (attemptedMove.x > 0)
    {
        var pos = game.popPosition();
        console.log(JSON.stringify(pos));
        board.removeObject({ x: attemptedMove.x, y: attemptedMove.y });
    }
	if (myTurn == game.turn)
	{
	   
		if (playAt(x,y))
		{
		    attemptedMove.x = x;
		    attemptedMove.y = y;
		    $("#submit-move").prop('disabled', false);
		}
	}
	

}

function onSubmitMove()
{
    
}

function onGameHandler(nkgsGame)
{
	console.log(nkgsGame.turn)
	myTurn = nkgsGame.turn;
	userId = nkgsGame.userId;
	gameId = nkgsGame.gameId;
	
	console.log(myTurn);

	board = new WGo.Board(document.getElementById("board"), {
	    width: 600,
	    section: {
	        top: 0,
	        left: 0,
	        right: -0.5,
	        bottom: -0.5
	    }
	});

	board.addEventListener("click", boardClickHandler);

	for (i in nkgsGame.moves)
	{
		playAt(nkgsGame.moves[i].x, nkgsGame.moves[i].y);
	}

	if (myTurn == -1)
	{
	    document.getElementById("stone-color").innerHTML = "Black";
	}
	else
	{
	    document.getElementById("stone-color").innerHTML = "White";
	}

	if (myTurn == game.turn)
	{
	    document.getElementById("game-turn").innerHTML = "Your turn";
	}
	else
	{
	    $("#game-turn").html("Opponent turn");
	}
}
 
 function onOppMoveHandler(move)
{
     //console.log('opponent move handler' + JSON.stringify(move));
     playAt(move.x, move.y);
     $("#game-turn").text("Your turn");
     $("#submit-move").prop('disabled', false);
 }
 socket.on('game', onGameHandler);
 socket.on('oppMove', onOppMoveHandler);

 $(document).ready(function () {
     $("#submit-move").prop('disabled', true);
     $("#submit-move").click(function () {
         if (attemptedMove.x === undefined)
             return;
         console.log('Sumit a move');
         if (myTurn == -1) {
             socket.emit('addMove', { userId: userId, gameId: gameId, order: 0, x: attemptedMove.x, y: attemptedMove.y });
         }
         else {
             socket.emit('addMove', { userId: userId, gameId: gameId, order: 1, x: attemptedMove.x, y: attemptedMove.y });
         }
         $("#game-turn").text("Opponent turn");
         attemptedMove.x = -1;
         attemptedMove.y = -1;
     });
 });