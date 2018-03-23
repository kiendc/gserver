var fs = require('fs');
exports.cfgFile = 'config.txt';
function loadConfig(configFile) {
    try {
        var data = fs.readFileSync(configFile);

        exports.config = JSON.parse(data);
        exports.cfgFile = configFile;
        console.log('Load config from file' + data);
        // Do something
    } catch (e) {

        var data = fs.readFileSync(cfgFile);

        exports.config = JSON.parse(data);
        console.log("Load default config: " + JSON.stringify(config));
    }
}// JavaScript source code

exports.loadConfig = loadConfig;



