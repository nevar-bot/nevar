require("module-alias/register");
const fs = require("fs");
const moment = require("moment");
const Logger = require("@helpers/Logger").default;

/* Installs all the files necessary for the bot */


Logger.log("Installation started..");

/* Config.toml */
const configText = fs.readFileSync('./assets/config.txt', 'utf8').toString()
    .replace('{version}', require('@root/package.json').version)

fs.writeFile('config-sample.toml', configText, function(e){
    if(e){
        Logger.error("Couldn't create config-sample.toml")
        console.error(new Error(e));
    }else{
        Logger.success("Successfully created config-sample.toml")
    }
});


/* Assets */

const disabledCommands = [];
const news = {
    "timestamp": Date.now(),
    "text": "Installed the bot"
}
const months = moment.months();
const voteObject = {};
for(let i = 1; i <= 12; i++) voteObject[months[i-1].toLowerCase()] = 0;

fs.writeFile('./assets/disabled.json', JSON.stringify(disabledCommands, null, 4), function(e){
    if(e){
        Logger.error("Couldn't create assets/disabled.json")
        console.error(new Error(e));
    }else{
        Logger.success("Successfully created assets/disabled.json")
    }
});

fs.writeFile('./assets/votes.json', JSON.stringify(voteObject, null, 4), function(e){
    if(e){
        Logger.error("Couldn't create assets/votes.json")
        console.error(new Error(e));
    }else{
        Logger.success("Successfully created assets/votes.json")
    }
});
