const Discord = require('discord.js')
const cron = require("node-cron")
require('dotenv').config()
const client = new Discord.Client()

// var monitoredChannel = client.channels.cache.get("245711852514967555")

client.on('ready', () => {
    client.user.setActivity("and listening", {type: "WATCHING"})
    console.log("Connected as " + client.user.tag)
    client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => { 
            if (channel.type == 'text') {
                cron.schedule("0 0 * * *", () => {
                    scheduledMessage(channel.id)
                })
            }
        })
    })
})

// client.on('message', (recievedMessage) => {
//     if (recievedMessage.author == client.user) {
//         return
//     }

//     if (receievedMessage.content.startsWith("!")){
//         processCommand(recievedMessage)
//     }
// })

function scheduledMessage(channelId) {
    var monitoredChannel = client.channels.cache.get(channelId)
    monitoredChannel.send("Encrypting and sending chat logs to Xi Jinping...")
}

function processCommand(recievedMessage) {
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments)

    if (primaryCommand == "help") {
        monitoredChannel.send("")
    }

}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"
secret_token = process.env.bot_secret_token
client.login(secret_token)
