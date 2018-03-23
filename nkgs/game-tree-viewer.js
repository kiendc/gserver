// JavaScript source code
var GameTreeViewer = function (elem, config) {
    this.width = 300;
    this.height = 600;
    this.stoneRadius = 14.6;
    this.unitX = 40.0;
    this.unitY = 40.0;

    var config = config || {};
        // set user configuration
    for (var key in config)
        this[key] = config[key];
    
    

    this.init();
    elem.appendChild(this.element);
}

GameTreeViewer.drawHandlers = {
    LB: {
        stone: {
            draw : function(args, board) {
                var xr = board.getX(args.x),
                    yr = board.getY(args.y),
                    sr = board.stoneRadius,
                    font = args.font || board.font || "";
				
                if (args.c == WGo.W)
                    this.fillStyle = "black";
                else if (args.c == WGo.B)
                    this.fillStyle = "white";
                else
                    this.fillStyle = "#1C1C1C";
				
                if (args.text.length == 1)
                    this.font = Math.round(sr * 1.5) + "px " + font;
                else if (args.text.length == 2)
                    this.font = Math.round(sr * 1.2) + "px " + font;
                else
                    this.font = Math.round(sr) + "px " + font;
				
                this.beginPath();
                this.textBaseline = "middle";
                this.textAlign = "center";
                this.fillText(args.text, xr, yr, 2 * sr);

            }
        }
    },
    BR: {
        stone: {
            draw: function (args, board) {
                var xr = board.getX(args.x),
                    yr = board.getY(args.y),
                    sr = board.stoneRadius;
            
                this.beginPath();
                this.moveTo(xr, yr);
                this.lineTo(Math.round(xr - sr / 2) - 0.5, Math.round(yr + sr / 3) + 0.5);
               

            }
        }
    },
}

GameTreeViewer.prototype = {
    constructor: GameTreeViewer,

    /**
     * Initialization method, it is called in constructor. You shouldn't call it, but you can alter it.
	 */

    init: function () {
        this.element = document.createElement('div');
        this.element.className = 'game-tree-viewer';
        this.element.style.width = '100%';
        this.element.style.height = this.height + 'px';
       
        this.shadow = new WGo.Board.ShadowLayer(1);
        this.stone = new WGo.Board.CanvasLayer();
        //this.addLayer(this.shadow, 200);
        this.addLayer(this.stone, 300);

        this.stoneHandler = WGo.Board.drawHandlers.NORMAL;
        this.labelHandler = GameTreeViewer.drawHandlers.LB;
    },
    addLayer: function (layer, weight){
        //layer.element.style.position = 'absolute';
        layer.element.style.zIndex = weight;
        layer.setDimensions(this.unitX * 10, this.unitY * 19 * 19);
        this.element.appendChild(layer.element);
    },  
    addMove: function (obj) {
        //this.stoneHandler.shadow.draw.call(this.shadow.context, obj, this);
        this.stoneHandler.stone.draw.call(this.stone.context, obj, this);
        this.labelHandler.stone.draw.call(this.stone.context, obj, this);
    },

    getX: function(x_s){
        return x_s * this.unitX + this.unitX / 2;
    },
    getY: function(y_s){
        return y_s * this.unitY + this.unitY / 2;
    },
    loadKifu: function (kifu) {
        this.kifu = kifu;

        this.kifuReader = new WGo.KifuReader(this.kifu, null);


    },
    last: function () {
        for (var i = 0; i < this.kifu.nodeCount; i++)
        {
            this.kifuReader.next();
            var obj = { x: 1, y: i, c: this.kifuReader.node.move.c, text: i + 1};
            this.addMove(obj);
        }
        
    }
}
