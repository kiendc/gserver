var spawn = require('child_process').spawn;
var leela = spawn('leela080.exe', ['--gtp'], { shell: true });
leela.stdout.pipe(process.stdout);

leela.on('close', (code) => {
    console.log('Leela quits');
});

leela.stdin.write("boardsize 19\n");
leela.stdin.write("showboard\n");
leela.stdin.write("quit\n");
//leela.stdin.end(); /// this call seems necessary, at least with plain node.js executable



//child.stdin.end(); /// this call seems necessary, at least with plain node.js executable// JavaScript source code
