var token = ""

var socket = null;
var userId = -1;
var userName = '';
var userPower = -1;

var currentPage = -1; // 0 login page, 1 - home page, 2 -game page
var board = null;



$(document).ready(function () {
   
    /*
   
    socket = io.connect({ query: 'token=' + token });
    socket.on('error', function (err) {
        console.log('Authentication failed ' + JSON.stringify(err));
    });
    */
    login();
   

});

