const Discord = require('discord.js')
const cron = require("node-cron")
require('dotenv').config()
const {pool} = require('./config')
const client = new Discord.Client()

var monitoredChannel
const dbClient = await pool.connect()

client.on('ready', () => {
    client.user.setActivity("and listening", {type: "WATCHING"})
    console.log("Connected as " + client.user.tag)
    client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => { 
            if (channel.type == 'text') {
                cron.schedule("0 0 * * *", () => {
                    scheduledMessage(channel.id)
                })
                monitoredChannel = client.channels.cache.get(channel.id)
            }
        })
    })
})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) {
        return
    }

    if (receivedMessage.content.startsWith("!")){
        processCommand(receivedMessage)
    }
})

function scheduledMessage(channelId) {
    var monitoredChannel = client.channels.cache.get(channelId)
    monitoredChannel.send("Encrypting and sending chat logs to Xi Jinping...")
}

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments)

    if (primaryCommand == "help") {
        monitoredChannel.send("I'm here to help")
    }
    
    else if (primaryCommand == "report") {
        dbClient.query(
            'INSERT INTO social_credit_score (name, score) VALUES ($1, $2)',
            ['Justin', 3],
            (err) => {
                if (err) {
                    return console.error("Query error", err.stack)
                }
            }
        )
    }

    else if (primaryCommand == "score") {
        dbClient.query(
            'SELECT * FROM social_credit_score WHERE name=$1',
            ['Justin'],
            (err, result) => {
                if (err) {
                    return console.error("Query error", err.stack)
                }
                console.log(result.rows[0])
            }
        )
    }
    

}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"
secret_token = process.env.bot_secret_token
client.login(secret_token)
