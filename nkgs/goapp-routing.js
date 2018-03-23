function closeLoginPage()
{
    $('#login-page').hide();
    $('#status-bar').show();
}
function closeHomePage()
{
    $("#games-grid").html("");
    $('#game-req-table > tbody').html('');
    $('#home-page').hide();
}

function closeGamePage()
{
    $('#board').html('');
    $("#chat-messages").html('');
    $('#game-dropdown-menu').hide();
    $('#game-page').hide();
}

function openLoginPage()
{
    currentPage = 0;
    $('#status-bar').hide();
    $("#login-page").show();
}

function showGameInfoPanel(mode)
{
    if (currentPage != 2)
        return;
    switch (mode)
    {
        case 0: // playing mode
            $('#game-info-panel').show();
            $("#game-playing-btn-grp").show();
            $('#analyzing-game-panel').hide();
            $('#estimate-game-score-panel').hide();
            break;
        case 1: // analyzing mode
            $('#game-info-panel').hide();
            $("#game-playing-btn-grp").hide();
            $('#analyzing-game-panel').show();
            $('#estimate-game-score-panel').hide();
            break;
        case 2: // scoring mode
            $('#game-info-panel').hide();
            $("#game-playing-btn-grp").hide();
            $('#analyzing-game-panel').hide();
            $('#estimate-game-score-panel').show();
            break;
    }
}
function renderStatusBar()
{
    $('#status-bar-username').html(userName);
    updateStatusBar();
}

function updateStatusBar()
{
    var s = $("#status-bar-games");
    if (inTurnGame > 0)
    {
        
        if (!s.hasClass('badge'))
        {
            s.addClass('badge');
        }
        
    }
    else
    {
        if (s.hasClass('badge'))
        {
            s.removeClass('badge');
        }
    }
    s.html(inTurnGame.toString());
    console.log('Update in game turn in status bar ' + inTurnGame.toString());
}

function renderHomePage(data)
{
    renderGameThumbnail(data.games);
    renderOnlineList(data.availUsers);
    renderGameReq(data.reqs);
}

function renderTimeLeft(userOrder)
{
    var timeLeft = playingGame.timeLeft[userOrder];
    var hours = Math.floor((timeLeft % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((timeLeft % (60 * 60)) / (60));
    var seconds = Math.floor((timeLeft % 60));
    if (userOrder == 0)
        $('#black-time-left').html(hours + " : " + minutes + " : " + seconds);
    else
        $('#white-time-left').html(hours + " : " + minutes + " : " + seconds);
}

function renderGameInfo(game) {
    if (game.turn == WGo.B)
        $("#game-turn").html("Black to move");
    else
        $("#game-turn").html("White to move");
    var gameState = game.getPosition();
    $("#black-capture").html(gameState.capCount.black + " captures");
    $("#white-capture").html(gameState.capCount.white + " captures");

    renderTimeLeft(0);
    renderTimeLeft(1);
}

function renderInGameMsg(order, msg) {
    var row = $('<div class="row msg_container"></div>');
    var msgCol = $('<div class="col-md-10 col-xs-10"></div>');
    var msgDiv = $('<div class="messages"></div>');
    var avaCol = $('<div class="col-md-2 col-xs-2 avatar"> \
                        <img src="images/avatar.jpg" class=" img-responsive "> \
                    </div>');   
    var t = $('<time datetime="2009-11-13T20:00"></time>')
   
    msgDiv.append('<p>' + msg + '</p>');
    msgDiv.append(t);
    msgCol.append(msgDiv);
    if (order == 0) {
        row.addClass('base_sent');
        t.append($("#black-username").html());
        msgDiv.addClass('msg_sent');
        row.append(msgCol);
        row.append(avaCol);
    }
    else if (order == 1) {
        row.addClass('base_receive');
        msgDiv.addClass('msg_receive');
        t.append($("#white-username").html());
        row.append(avaCol);
        row.append(msgCol);
    }
    
    $('#chat-content').append(row);
    console.log("showing msg: " + JSON.stringify(row) + ' with order ' + order);
    /*
    var li = $('<li href="#" class="list-group-item"></li>');
    var h = $('<h5 class="list-group-item-heading"></h5>');
    if (order == 0) {
        li.addClass('list-group-item-success');
        h.append($("#black-username").html());
    }
    else if (order == 1) {
        li.addClass('list-group-item-info');
        h.append($("#white-username").html());
    }
    var p = $('<p class="list-group-item-text"></p>');
    p.append(msg);
    li.append(h);
    li.append(p);
    $('#chat-messages').append(li);
    
    console.log("showing msg: " + JSON.stringify(li) + ' with order ' + order);
    */
}

function renderCellInGameGrid(g)
{
    var col = $('<div class="col-md-4"></div');


    var gamePanel = $('<div class="panel game-preview" id="game-' + g.gameId + '">' +
                        '<div class="panel-heading">' + g.players[0].username + ' vs ' + g.players[1].username + '</div>' +
                        '<div class="panel-body"><div id="board-' + g.gameId + '"></div></div>' +
                        '<div class="panel-footer">Game ' + g.gameId + '</div>' +
                      '</div>');
    var order = 0;
    if (userId == g.players[1].userid)
        order = 1;
    if ((order == 0 && g.state.color == WGo.W) || (order == 1 && g.state.color == WGo.B))
        gamePanel.addClass('panel-info');
    else
        gamePanel.addClass('panel-default');
    gamePanel.click(onGamePreviewClick);
    col.append(gamePanel);
    return col;
}

function renderGameThumbnail(games)
{
    var nbRows = Math.floor(games.length / 3) + 1;
    var k = 0;
    $("#games-grid").html("");
    for (var i = 0; i < nbRows; i++) {
        var row = $('<div class="row"></div>');
        $("#games-grid").append(row);
        for (var j = 0; j < 3; j++) {
            if (k >= games.length)
                break;
            var g = games[k];
            var col = renderCellInGameGrid(g);
            row.append(col);
            k++;
        }
    }
    for (i in games) {
        var game = games[i];
        var board = new WGo.Board(document.getElementById("board-" + game.gameId), {
            width: 245
        });
        var gamePos = new WGo.Position(game.state.size);
        console.log('Draw: ' + JSON.stringify(gamePos));
        gamePos.schema = game.state.schema;
        drawGameBoard(gamePos, board);
    }
}

function addToOnlineList(u)
{
    var li = $('<li class="media" id="online-' + u.userid + '">\
                        <div class="media-body">\
                            <div class="media">\
                                <a class="pull-left" href="#">\
                                    <img class="media-object img-circle" style="max-height:40px;" src="images/avatar.jpg" />\
                                </a>\
                                <div class="media-body" >\
                                    <h5>' + u.username + '</h5>\
                                    <small class="text-muted">Active From 3 hours</small>\
                                </div>\
                             </div>\
                        </div>\
                    </li>');
    $('#online-player-list').append(li);
}

function removeFromOnlineList(uId)
{
    $('li').remove('#online-' + uId);
}

function renderOnlineList(availUsers)
{
    $('#online-player-list').html("");
    for (i in availUsers) {
        var u = availUsers[i];
        addToOnlineList(u);      
    }
}

function renderGameReq(reqs)
{
    for (var i in reqs)
    {
        var r = reqs[i];
        addGameRequest(r);
    }
}

function renderSGFPlayer()
{
    var elem = document.getElementById("player");
    if (playingGame.player == null)
    {
        playingGame.player = new NKGSPlayer(elem, {
            enableWheel: false,
            enableKeys: false,
            board: {
                width: 600
            }
        });
        playingGame.player.init();
        playingGame.player.board.addEventListener("click", boardClickHandler);
        /*
        if (WGo.mozilla)
            playingGame.player.element.keypress = onKeyPressed.bind(playingGame);
        else
            playingGame.player.element.keydown = onKeyPressed.bind(playingGame);
        */
        $("#player").keyup(onArrowKeyPressed.bind(playingGame));
        
        console.log('Create player');
    }
    else
    {

        playingGame.player.board.removeAllObjects();
        playingGame.player.kifu = null;
        console.log('Reuse player');
    }
  
    
}

function renderAnalyzingTreeViewer() {
    var elem = document.getElementById("tree-viewer");
    if (playingGame.treeViewer == null)
    {
        playingGame.treeViewer = new GameTreeViewer(elem, {   
        });
       
    }
}

function addGameRequest(r)
{
    var tr = $(' <tr id="req-' + r.reqId + '"></tr>');
    if (r.type == 0) {
        tr.addClass('success');
        tr.append('<td>' + r.opponent.username + '</td>');
        tr.append('<td>19x19, Japanesse rule</td>');
        tr.append('<td> \
                        <button class="btn btn-warning pull-left btn-accept-req">Accept</button> \
                        <button class="btn btn-warning pull-right btn-refuse-req">Refuse</button> \
                      </td>');
    }
    else {
        tr.addClass('info');
        tr.append('<td>' + r.opponent.username + '</td>');
        tr.append('<td>19x19, Japanesse rule</td>');
        tr.append('<td><button class="btn btn-warning btn-refuse-req">Cancel</button></td>');
    }
    $('#game-req-table > tbody').append(tr);
}

function removeGameRequest(reqId)
{
   $('tr#req-' + reqId).remove();
   console.log('Remove the request with ID: ' + reqId);
       
}

function addGameToThumbnail(game)
{
    var rows = $("#games-grid").children();
    var lastRow = rows[rows.length - 1];
    if (lastRow.childNodes.length == 3)
    {
        // Add a new row
        lastRow = $('<div class="row"></div>');
        $("#games-grid").append(lastRow);
    }
    else
    {
        lastRow = $(lastRow);
    }
    var col = renderCellInGameGrid(game);
    lastRow.append(col);

    var board = new WGo.Board(document.getElementById("board-" + game.gameId), {
        width: 245
    });
    var gamePos = new WGo.Position(game.state.size);
    console.log('Draw: ' + JSON.stringify(gamePos));
    gamePos.schema = game.state.schema;
    drawGameBoard(gamePos, board);
}

function playingTimer() {
    if (playingGame.myTurn == WGo.B) {
        playingGame.timeLeft[0] = playingGame.timeLeft[0] - 1;
        renderTimeLeft(0);
    }
    else {
        playingGame.timeLeft[1] = playingGame.timeLeft[1] - 1;
        renderTimeLeft(1);
    }
}