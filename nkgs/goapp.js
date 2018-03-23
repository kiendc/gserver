var x = document.cookie;
console.log('Cookie : ' + JSON.stringify(x));
var token = ""

var userId = -1;
var userName = '';

var currentPage = -1; // 0 login page, 1 - home page, 2 -game page
var socket = io.connect({ query: 'token=' + token });
socket.on('error', function (err) {
    console.log('Authentication failed ' + JSON.stringify(err));
   
    login();
});




//////////////////////////////////////////////////
function onSocketUnauthorized (error) {
    console.log('Unauthorized ' + JSON.stringify(error));
    if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
        // redirect user to login page perhaps or execute callback:
        console.log("User's token has expired");
    }
}

function onSocketConnected()
{
    console.log('Client connect to server');
    $('#login-page').hide();
    
    closeLoginPage();
    closeGamePage();
}

function onLoginElsewhere()
{
    console.log('Login elsewhere, you are disconnected now');
    socket.disconnect();
    token = "";
    $('#nkgs-client').append($(' <div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Warning!</strong> You are already logged-in elsewhere </div>'));
    login();
}

function onOtherPlayerLogin(user)
{
    console.log('Player ' + user.username + ' says hi');
    addToOnlineList(user);
}

function onOtherPlayerLogout(uId) {
    console.log('Player of id ' + uId + ' says goodbye');
    removeFromOnlineList(uId);
}
////////////////////////////////////////////
function onShowHomePage(data) {
    console.log('Show home page' + JSON.stringify(data));
    userId = data.userid;
    userName = data.username;
    currentPage = 1;
    intializeInTurnGames(userId, data.games);
    renderStatusBar();
    renderHomePage(data);
    $('#home-page').show();
}

function onShowGamePage(nkgsGame)
{
    closeLoginPage();
    closeHomePage();
    currentPage = 2;
    renderSGFPlayer();
    renderAnalyzingTreeViewer();
    setupGame(nkgsGame);
    console.log('Load new kifu for player');
    
    $("#black-username").html(nkgsGame.players[0].username);
    $("#white-username").html(nkgsGame.players[1].username);
 
    renderGameInfo(playingGame.player.kifuReader.game);

    
  
    $('#chat-content').html('');
    for (var i in nkgsGame.messages)
    {
        
        renderInGameMsg(nkgsGame.messages[i].order, nkgsGame.messages[i].msg);
    }
    //$('#game-mode #play-mode').checked = true;
    //$('#game-mode #analyze-mode').checked = false;
    $('#game-dropdown-menu-name').html("Game " + nkgsGame.gameId + '<span class="caret"></span>');
    $('#game-dropdown-menu').show();
    $('#game-page').show();
    showGameInfoPanel(0); // playing mode
    if (playingGame.player.kifuReader.game.turn == playingGame.myTurn)
    {
        playingGame.timer = setInterval(function () {
            playingTimer();
        }, 1000);
    }
    
}

////////////////////////////////////////////
function onGamePreviewClick()
{
    var elemId = $(this).attr('id');
    console.log(elemId + ': ' + elemId.slice(5));
    gameId = parseInt(elemId.slice(5));
    socket.emit('play-game', { userid: userId, gameId: gameId });
}

function onCloseGame()
{
    console.log('Close the game');
    var msg = { userid: userId, gameId: playingGame.gameId, timeLeft: playingGame.timeLeft };
    socket.emit('close-game', msg);
    resetGame.call(playingGame);
    closeGamePage();
    $('#home-page').show();
    
}

function onSaveGame() {
    console.log('Save the game');
    var msg = { userid: userId, gameId: gameId };
    socket.emit('save-game', msg);

}

function onOppMoveHandler(move)
{
    if (currentPage < 1)
        return;
    inTurnGame++;
    updateStatusBar();
    notifyMe('Hey ' + userName + ', your turn in game ' + move.gameId.toString() + ' !');
    
    if (currentPage == 1)
    {
        console.log('Update home page ');
        $('#game-' + move.gameId).removeClass('panel-default');
        $('#game-' + move.gameId).addClass('panel-info');
    }
    else if (currentPage == 2)
    {
        console.log('receive a move in game ' + move.gameId + ' my current game ' + playingGame.gameId);
        if (move.gameId == playingGame.gameId) {
            opponentPlay.call(playingGame, move);
            if (playingGame.myTurn == WGo.B)
            {
                playingGame.timeLeft[1] = move.timeLeft;
            }
            else
            {
                playingGame.timeLeft[0] = move.timeLeft;
            }

            renderGameInfo(playingGame.player.kifuReader.game);
            
            
            $("#btn-submit-pass").prop('disabled', false);
            playingGame.timer = setInterval(function () {
                playingTimer();
            }, 1000);
        }
        else
        {
            $.notify('Your turn!');
        }
    }
       
    console.log('opponent move handler' + JSON.stringify(move));

}

function onSubmitMove() {

    submitMove.call(playingGame);
    updateStatusBar();
    playingGame.currKifuNode = playingGame.player.kifuReader.node;
    var game = playingGame.player.kifuReader.game;

    renderGameInfo(game);
    
    $("#btn-submit-move").prop('disabled', true);
    $("#btn-submit-pass").prop('disabled', true);
    $("#btn-button").prop('disabled', false);

    var state = game.getPosition();
    var order = 1;
    if (playingGame.myTurn == WGo.B)
    {
        order = 0;
    }    
    socket.emit('add-move', { userid: userId, gameId: gameId, order: order, move: playingGame.lastMove, state: state, timeLeft: playingGame.timeLeft[order] });
    clearInterval(playingGame.timer);
}

function onAnalyzeGame()
{
    playingGame.mode = 1;
    switchToAnalyzeMode.call(playingGame);
    showGameInfoPanel(playingGame.mode);
}

function onFinishAnalyzingGame() {
    playingGame.mode = 0;  
    switchToPlayMode.call(playingGame);
    showGameInfoPanel(playingGame.mode);
}

function onScoreGame()
{
    if (playingGame.scoreMode == null)
    {
        console.log('Enter scoring mode');
        playingGame.mode = 2;
        var player = playingGame.player;
        player.setFrozen(false);
        //playingGame.scoreMode = new WGo.ScoreMode(player.kifuReader.game.position, player.board, player.kifu.info.KM || 0.5, player.notification);
        playingGame.scoreMode = new NKGSGameEstimator(player);
        playingGame.scoreMode.start();
        playingGame.scoreMode.displayScore();
        showGameInfoPanel(playingGame.mode);
    }  
}

function onFinishScoringGame()
{
    playingGame.player.setFrozen(false);
    playingGame.scoreMode.end();
    delete playingGame.scoreMode;
    playingGame.scoreMode = null;
    console.log('Finish scoring');
    playingGame.mode = 0;
    showGameInfoPanel(playingGame.mode);
}

function onSendInGameMsg()
{
    //console.log('Prepare sending message');
    
    var msg = $('#chat-msg-input').val().trim();
    if (msg.length < 1)
        return;

    var order = 0;
    if (playingGame.myTurn == WGo.W)
        order = 1;

    renderInGameMsg(order, msg);
    socket.emit('in-game-msg', {
        userid: userId,
        gameId: gameId,
        order: order,
        msg: msg
    });

    $('#chat-msg-input').val('');
}

function onSendGameReq()
{
    var opponent = $('#game-req-username-input').val().trim();
    socket.emit('add-game-req', {
        userid: userId,
        opponent: opponent
    });
    $('#game-req-modal').modal('hide')
}

function onRefuseGameReq()
{
    var reqId = parseInt($(this).closest('tr').attr('id').slice(4));
    socket.emit('remove-game-req', {
        userid: userId,
        reqId: reqId
    });
    console.log('Refuse request ' + reqId);
}

function onAcceptGameReq() {
    var reqId = parseInt($(this).closest('tr').attr('id').slice(4));
    socket.emit('accept-game-req', {
        userid: userId,
        reqId: reqId
    });
    console.log('Accept request ' + reqId);
}

function onOppMsg(data)
{
    renderInGameMsg(data.order, data.msg);
}

function onGameReqAddConfirm(req)
{
    console.log('Receive confirmation of adding request game ' + JSON.stringify(req));
    addGameRequest(req);
}

function onGameReqRemoveConfirm(data) {
    console.log('Receive confirmation of removing request game ' + JSON.stringify(data.reqId));
    removeGameRequest(data.reqId);
    if (data.game != undefined)
    {
        console.log('Add a game to game grid of ');
        addGameToThumbnail(data.game);
    }
}

function notifyMe(msg) {
    // Let's check if the browser supports notifications
    console.log('Begin notifying');
    if (!("Notification" in window)) {
        alert("This browser does not support system notifications");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted")
    {
        // If it's okay let's create a notification
        console.log('Notification is granted');
        var notification = new Notification(msg);
    }

        // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied')
    {
        console.log('Notification is denied, request permission');
        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            console.log('Request permission');
            if (permission === "granted")
            {
                console.log('Permission is accepted');
                var notification = new Notification(msg);
            }
        });
    }

    // Finally, if the user has denied notifications and you 
    // want to be respectful there is no need to bother them any more.
}


function login()
{
    console.log('login here!');
    closeHomePage();
    closeGamePage();
    openLoginPage();
}

$(document).ready(function () {
    console.log('DOM is ready');
    $("#login-page").hide();
    closeHomePage();
    closeGamePage();
    
    $('#login-form').submit(function (e) {
        e.preventDefault();
        
        var data = {
            username: $('#inputUsername').val(),
            password: $('#inputPassword').val()
        };
        console.log('Submitting login form with data' + JSON.stringify(data));
        $.ajax({
            type: 'POST',
            url: '/login',
            data: data
        }).done(function (result) {
            if (result.error == 0)
            {
                token = result.token;
                console.log('Login successful, try to reconnect with token' + token);
                document.cookie.token = token;
                delete socket;
                userName = result.user.username;
                socket = io.connect({ query: 'token=' + token });
                

                socket.on("unauthorized", onSocketUnauthorized);
                socket.on('connect', onSocketConnected);
                socket.on('login-elsewhere', onLoginElsewhere);
                socket.on('hi', onOtherPlayerLogin);
                socket.on('bye', onOtherPlayerLogout);

                socket.on('show-home-page', onShowHomePage);
                socket.on('show-game-page', onShowGamePage);

                socket.on('opp-move', onOppMoveHandler);
                socket.on('opp-msg', onOppMsg);

                socket.on('game-req-add-confirm', onGameReqAddConfirm);
                socket.on('game-req-rem-confirm', onGameReqRemoveConfirm);

            }
            else
            {
                $('#nkgs-client').append($(' <div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong> User not found </div>'));   
            }
        });
      
      
    });

    $("#btn-submit-move").prop('disabled', true);
    $("#btn-submit-move").on('click', onSubmitMove);
    $("#btn-undo").prop('disabled', true);

    $('#btn-analyze-game').on('click', onAnalyzeGame);
    $('#btn-finish-analyzing-game').on('click', onFinishAnalyzingGame);
    $('#btn-estimate-score').on('click', onScoreGame);
    $('#btn-finish-scoring-game').on('click', onFinishScoringGame);
      
    
    $("#btn-close-game").on('click', onCloseGame);
    $('#game-menu-close').on('click', onCloseGame);
    $("#btn-save-game").on('click', onSaveGame);
    $('#game-menu-save').on('click', onSaveGame);

    $("#btn-send-msg").on('click', onSendInGameMsg);
    $("#btn-send-game-req").on('click', onSendGameReq);

    //$("#game-mode").on("change", onGameModeChanged);

    //$(".btn-refuse-req").on('click', onRefuseGameReq);
    $(document).on('click', ".btn-refuse-req", onRefuseGameReq); // Button is added dynamically
    $(document).on('click', ".btn-accept-req", onAcceptGameReq); // Button is added dynamically
    
    /*
    if (WGo.mozilla)
        document.onkeypress = onKeyPressed.bind(playingGame);
    else
        document.onkeydown = onKeyPressed.bind(playingGame);
    */
    document.onkeydown = function (e) {
        //console.log('Document handle keydown ' + e.keyCode);
        //console.log('Focused element: ' + document.activeElement);
        if (document.activeElement.id != "chat-msg-input") {
            $("#player").focus();
        }
    }
});

