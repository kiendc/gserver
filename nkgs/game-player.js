
function removeNodeForest(root)
{
    var currNode = root;
    var nodeStack = [];
    var child = null;
    // Remove all children of current playing node
    while (currNode.children.length > 0) {
        child = currNode.children.pop();
        child.parent = null;
        nodeStack.push(child);
    }

    // Remove the node forest of analyzing
    while (nodeStack.length > 0) {
        currNode = nodeStack.pop();
        while (currNode.children.length > 0) {
            child = currNode.children.pop();
            child.parent = null;
            nodeStack.push(child);
        }
        delete currNode;
    }
}

var NKGSPlayer = WGo.extendClass(WGo.Player, function (elem, config) {
    this.config = config;

    // add default configuration of Player class
    for (var key in WGo.Player.default)
        if (this.config[key] === undefined && WGo.Player.default[key] !== undefined)
            this.config[key] = WGo.Player.default[key];

    this.element = elem;
    this.board = new WGo.Board(elem, this.config.board);
    var coordinates = {
        grid: {
            draw: function (args, board) {
                var ch, t, xright, xleft, ytop, ybottom;

                this.fillStyle = "rgba(0,0,0,0.7)";
                this.textBaseline = "middle";
                this.textAlign = "center";
                this.font = board.stoneRadius + "px " + (board.font || "");

                xright = board.getX(-0.75);
                xleft = board.getX(board.size - 0.25);
                ytop = board.getY(-0.75);
                ybottom = board.getY(board.size - 0.25);

                for (var i = 0; i < board.size; i++) {
                    ch = i + "A".charCodeAt(0);
                    if (ch >= "I".charCodeAt(0)) ch++;

                    t = board.getY(i);
                    this.fillText(board.size - i, xright, t);
                    this.fillText(board.size - i, xleft, t);

                    t = board.getX(i);
                    this.fillText(String.fromCharCode(ch), t, ytop);
                    this.fillText(String.fromCharCode(ch), t, ybottom);
                }

                this.fillStyle = "black";
            }
        }
    }
    this.setCoordinates(coordinates);
   
});

/*
NKGSPlayer.prototype.setKeys = function (b) {
    if (b) {
        if (WGo.mozilla)
            document.onkeypress = key_listener.bind(this);
        else
            document.onkeydown = key_listener.bind(this);
    }
    else {
        if (WGo.mozilla)
            document.onkeypress = null;
        else
            document.onkeydown = null;
    }
}
*/
NKGSPlayer.prototype.error = function(err) {
    if (console)
        console.log(err);
    throw err;
}
