var NKGSGameEstimator = WGo.extendClass(WGo.ScoreMode, function (player) {
    this.originalPosition = player.kifuReader.game.position;
    this.position = player.kifuReader.game.position.clone();
    this.board = player.board;
    this.komi = player.kifu.info.KM || 0.5;
    this.output = console.log;
});

var state = WGo.ScoreMode.state = {
    UNKNOWN: 0,
    BLACK_STONE: 1, // must be equal to WGo.B
    WHITE_STONE: -1, // must be equal to WGo.W
    BLACK_CANDIDATE: 2,
    WHITE_CANDIDATE: -2,
    BLACK_NEUTRAL: 3,
    WHITE_NEUTRAL: -3,
    NEUTRAL: 4,
}

NKGSGameEstimator.prototype.displayScore = function () {
    var score = {
        black: [],
        white: [],
        neutral: [],
        black_captured: [],
        white_captured: [],
    }

    for (var i = 0; i < this.position.size; i++) {
        for (var j = 0; j < this.position.size; j++) {
            s = this.position.get(i, j);
            t = this.originalPosition.get(i, j);

            if (s == state.BLACK_CANDIDATE) score.black.push({ x: i, y: j, type: "mini", c: WGo.B });
            else if (s == state.WHITE_CANDIDATE) score.white.push({ x: i, y: j, type: "mini", c: WGo.W });
            else if (s == state.NEUTRAL) score.neutral.push({ x: i, y: j });

            if (t == WGo.W && s != state.WHITE_STONE) score.white_captured.push({ x: i, y: j, type: "outline", c: WGo.W });
            else if (t == WGo.B && s != state.BLACK_STONE) score.black_captured.push({ x: i, y: j, type: "outline", c: WGo.B });
        }
    }

    for (var i = 0; i < score.black_captured.length; i++) {
        this.board.removeObjectsAt(score.black_captured[i].x, score.black_captured[i].y);
    }

    for (var i = 0; i < score.white_captured.length; i++) {
        this.board.removeObjectsAt(score.white_captured[i].x, score.white_captured[i].y);
    }

    this.board.addObject(score.white_captured);
    this.board.addObject(score.black_captured);
    this.board.addObject(score.black);
    this.board.addObject(score.white);

    var msg = "<p style='font-weight: bold;'>" + WGo.t("RE") + "</p>";

    var sb = score.black.length + score.white_captured.length + this.originalPosition.capCount.black;
    var sw = score.white.length + score.black_captured.length + this.originalPosition.capCount.white + parseFloat(this.komi);

    msg += "<p>" + WGo.t("black") + ": " + score.black.length + " + " + (score.white_captured.length + this.originalPosition.capCount.black) + " = " + sb + "</br>";
    msg += WGo.t("white") + ": " + score.white.length + " + " + (score.black_captured.length + this.originalPosition.capCount.white) + " + " + this.komi + " = " + sw + "</p>";

    if (sb > sw) msg += "<p style='font-weight: bold;'>" + WGo.t("bwin", sb - sw) + "</p>";
    else msg += "<p style='font-weight: bold;'>" + WGo.t("wwin", sw - sb) + "</p>";

    $('#score-result').html(msg);
    //console.log(msg);
}