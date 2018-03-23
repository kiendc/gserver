var spawn = require('child_process').spawn;
X_Coordinate = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
function getGTPCoordinate(move)
{
    var y = 19 - move.y;
    return X_Coordinate[move.x] + '' + y;
}

function getMove(gtpCoor)
{
    var xStr = gtpCoor[0];
    var yStr = gtpCoor.substring(1);
    var x = X_Coordinate.indexOf(xStr.toUpperCase());
    var y = 19 - parseInt(yStr);
    return { x: x, y: y };
}
function parseOutput(output)
{
    var cmdOuts = output.split(/[=\?]/);
    // Check if the first substring is the remain of 
    // previous output. If it is not the case, remove 
    // this empty substring from result array.
    if (cmdOuts[0].length < 1)
    {
        cmdOuts.shift();
    }
    
    // Remove carriage return from 
    for (var i in cmdOuts)
    {
        cmdOuts[i] = cmdOuts[i].trim();
    }
    console.log('parse output to get ' + JSON.stringify(cmdOuts));
    return cmdOuts;
}

Leela.cmdOutputHandler = {
    "genmove": function (input, output) {
        output.trim();
        if (output.length < 1)
        {
            console.log('No output, do nothing');
            return;
        }
       
        var move = getMove(output);
        var callback = this.cmdCallback['genmove'];
        var order = 0;
        if (input.localeCompare('white') == 0)
            order = 1;
        if (callback != undefined) {
            callback({ gameId: this.gameId, type: 1, userid: this.userId, order: order, move: move });
        }
        this.playMove(order, move);
    }
}


function Leela(gId, uId)
{
    this.gameId = gId;
    this.userId = uId;
    this.proc = spawn('leela080.exe', ['--gtp'], { shell: true });
    //leela.stdout.pipe(process.stdout);
    this.cmdCallback = {};
    this.sentCmds = [];

    this.proc.on('close', function (code) {
        console.log('Leela quits ' + code);
    }.bind(this));

    this.proc.stdout.on('data', function (data) {   
        console.log('stdout ' + data.toString());
        console.log('sent cmd ' + JSON.stringify(this.sentCmds));
        if (this.sentCmds.length < 1)
        {
            // No command is waiting 
            return;
        }
        var cmdOutputs = parseOutput(data.toString());
        for (var c in cmdOutputs)
        {
            var fullCmd = this.sentCmds.shift();
            var cmd = fullCmd.cmd;
            var cmdOutput = cmdOutputs[c];
            console.log('Leela replies for ' + cmd + ' ' + cmdOutput);
            var handler = Leela.cmdOutputHandler[cmd];
            if (handler != undefined) {
                handler.call(this, fullCmd.arg, cmdOutput);
            }
        }
        
        
    }.bind(this));

    this.proc.stderr.on('data', function (data) {
        //console.log('Leela error: ' + data.toString());
    }.bind(this));

}

Leela.prototype.GTPCmd = function(cmd, arg)
{
    this.sentCmds.push({ cmd: cmd, arg: arg });
    this.proc.stdin.write(cmd + ' ' + arg + '\n');
}

Leela.prototype.initGame = function (gSize) {
    this.GTPCmd('boardsize', gSize);
};

Leela.prototype.quitGame = function (gSize) {
    this.GTPCmd('quit', '');
};

Leela.prototype.playMove = function (c, move) { // c = 0/1, move = {x:1, y:2}
    var moveCoor = getGTPCoordinate(move);
    color = 'black';
    if (c == 1)
        color = 'white';
    var gtpCmdArg = color + ' ' + moveCoor;
    console.log('playMove: ' + gtpCmdArg);
    this.GTPCmd('play', gtpCmdArg);
};

Leela.prototype.replyMove = function (c, move) {
    this.playMove(c, move);
    var gtpCmdArg = 'white';
    if (c == 1)
        gtpCmdArg = 'black';
    console.log('replyMove: ' + gtpCmdArg);
    this.GTPCmd('genmove', gtpCmdArg);

};

Leela.prototype.setCallBackFunction = function(cmd, callback){
    this.cmdCallback[cmd] = callback;
}


module.exports = Leela;
