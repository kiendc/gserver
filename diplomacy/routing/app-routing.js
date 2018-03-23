
function onLoginServer(e) {
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
            userName = result.user.username;
            userId = result.user.userid;
            socket = io.connect({ query: 'token=' + token });
           
            socket.on('connect', onSocketConnected.bind(socket));
            socket.on('game-data', onReceiveGame);

        }
        else
        {
            $('#diplomacy-client').append($(' <div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><strong>Danger!</strong> User not found </div>'));   
        }
    });

}


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
    closeLoginPage();
    openGamePage();
    this.emit("game", {userId: userId, gameId: 0});
    
}
function onReceiveGame(gameData)
{
    //console.log(gameData.board.neighborMap);
    userPower = gameData.userPower;
    game.board = {
        neighborMap: new Map([...gameData.board.neighborMap])
    }
    initBoard(board, game);
    var gameState = gameData.game.state;
    //console.log(gameState)
    updateBoard(board, gameState);
    initPowerPanel(gameState);
}

function onSubmitOrders()
{
    console.log("Onclick callback of button");
    console.log(this.orders);
    var orders = this.get(); 
    console.log(orders);
    socket.emit("orders", {
        gameId: 0,
        power: userPower,
        orders: orders
    });
}

function login() {
    console.log('login here!');
    closeGamePage();
    openLoginPage();
}

function openLoginPage() {
    currentPage = 0;
    $('#login-form').submit(onLoginServer);
    $("#login-page").show();
}

function closeLoginPage() {
    $('#login-page').hide();
}

function openGamePage() {
    board = drawBoard();
    $('#game-page').show();
}

function closeGamePage() {
    $('#game-page').hide();
}

