var fs = require('fs');

exports.maxUID = 0;
exports.cfgFile = '';

function saveConfig()
{
    var conf = {
        maxUID: exports.maxUID,
        users: []
    }
    for (var i in exports.users) {
        var uId = exports.users[i].userid;
        conf.users.push(uId);
        saveUser(uId);
    }

    fs.writeFileSync('users/' + exports.cfgFile, JSON.stringify(conf));
}

function findUser(userId) {
    for (var i in exports.users)
    {
        var u = exports.users[i];
        if (u.userid == userId)
            return u;
    }
    return undefined;    
}
function findUserByName(userName)
{
    for (var i in exports.users) {
        var u = exports.users[i];
        if (u.username.localeCompare(userName) == 0)
            return u;
    }
    return undefined;
}

function saveUser(uId) {
    var u = findUser(uId);
    if (u != undefined)
    {
        console.log('Save user profile ' + uId);
        fs.writeFileSync('users/u' + uId + '.txt', JSON.stringify(u));
    }
    
}



function loadConfig(cfgFile) {
    var conf = undefined;
    try {
        console.log('Load user configuration file ' + cfgFile);
        var fileName = 'users/' + cfgFile;
        var data = fs.readFileSync(fileName);
        console.log('User configuration file content: ' + data);
        conf = JSON.parse(data);
        exports.cfgFile = cfgFile;
    }
    catch (e) {
        exports.users = undefined;
        console.log('Error in reading user configuration file');
        return;
    }
    if (conf == undefined)
    {
        return;
    }
    exports.maxUID = conf.maxUID;
    var userIds = conf.users;

    exports.users = [];
    
    for (var i in userIds) {
        var uId = userIds[i];
        var fileName = 'users/u' + uId + '.txt';
        try {
            var data = fs.readFileSync(fileName);

            exports.users.push(JSON.parse(data));
            //console.log('Load user data from file');
            // Do something
        } catch (e) {
            console.log("Error in loading user profile for " + uId);   
        }
    }
    console.log('All user in server: ' + JSON.stringify(exports.users));
}

function getUserName(uId)
{
    var u = findUser(uId);
    if (u != undefined)
        return u.username;
    return undefined;  
}

exports.saveConfig = saveConfig;
exports.findUser = findUser;
exports.findUserByName = findUserByName
exports.saveUser = saveUser;
exports.loadConfig = loadConfig;
exports.getUserName = getUserName;